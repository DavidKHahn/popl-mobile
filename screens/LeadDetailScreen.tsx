import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Chip, ActivityIndicator, Button, Divider } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import { useQuery } from '@tanstack/react-query';
import { leadsApi } from '../api/leadsApi';
import { formConfigApi } from '../api/formConfigApi';
import { format } from 'date-fns';
import { FormConfig } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'LeadDetail'>;

export default function LeadDetailScreen({ route, navigation }: Props) {
  const { leadId } = route.params;

  // Fetch lead data using TanStack Query
  const { 
    data: lead, 
    isLoading, 
    isError, 
    error,
    refetch
  } = useQuery({
    queryKey: ['lead', leadId],
    queryFn: async () => {
      console.log('Fetching lead with ID:', leadId);
      try {
        const response = await leadsApi.getById(leadId);
        console.log('Lead data received:', response.data);
        return response.data;
      } catch (err) {
        console.error('Error fetching lead:', err);
        throw err;
      }
    }
  });

  // Fetch form configuration to know field labels
  const { data: formConfig } = useQuery({
    queryKey: ['form-config'],
    queryFn: async () => {
      const response = await formConfigApi.getFormConfig();
      return response.data as FormConfig;
    },
  });

  // For debugging
  console.log('Component state:', { isLoading, isError, lead, errorMessage: error?.message });

  // Format date helper function
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP'); // e.g., "April 29, 2023"
    } catch (e) {
      return dateString;
    }
  };

  // Set navigation title when lead data is available
  React.useEffect(() => {
    if (lead) {
      navigation.setOptions({ title: lead.name });
    }
  }, [lead, navigation]);

  // Check if the lead has any custom fields
  const hasCustomFields = React.useMemo(() => {
    if (!lead || !formConfig) return false;
    
    // Check if any custom field from the form config exists in the lead data
    return formConfig.fields.some(field => 
      // Skip standard fields that are already displayed
      !['name', 'email', 'phone', 'company', 'title', 'notes'].includes(field.key) && 
      lead[field.key] !== undefined && 
      lead[field.key] !== null && 
      lead[field.key] !== ''
    );
  }, [lead, formConfig]);

  // Get custom fields to display
  const customFieldsToDisplay = React.useMemo(() => {
    if (!lead || !formConfig) return [];
    
    return formConfig.fields
      .filter(field => 
        // Skip standard fields that are already displayed
        !['name', 'email', 'phone', 'company', 'title', 'notes'].includes(field.key) && 
        lead[field.key] !== undefined && 
        lead[field.key] !== null && 
        lead[field.key] !== ''
      )
      .map(field => ({
        key: field.key,
        label: field.label,
        value: lead[field.key]
      }));
  }, [lead, formConfig]);

  // Show loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading lead details...</Text>
      </View>
    );
  }

  // Show error state
  if (isError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Error loading lead</Text>
        <Text style={styles.errorMessage}>{error?.message || 'Unknown error'}</Text>
        <Button 
          mode="contained" 
          onPress={() => refetch()} 
          style={styles.retryButton}
        >
          Retry
        </Button>
      </View>
    );
  }

  // If no lead data is available
  if (!lead) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Lead not found</Text>
        <Text style={styles.errorMessage}>The requested lead could not be found</Text>
        <Button 
          mode="contained" 
          onPress={() => navigation.goBack()} 
          style={styles.retryButton}
        >
          Back to List
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Basic Information Card */}
      <Card style={styles.card}>
        <Card.Title title="Basic Information" />
        <Card.Content>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name:</Text>
            <Text style={styles.infoValue}>{lead.name}</Text>
          </View>
          <Divider style={styles.divider} />
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{lead.email}</Text>
          </View>
          <Divider style={styles.divider} />
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone:</Text>
            <Text style={styles.infoValue}>{lead.phone}</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Company Information Card */}
      <Card style={styles.card}>
        <Card.Title title="Company Information" />
        <Card.Content>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Company:</Text>
            <Text style={styles.infoValue}>{lead.company}</Text>
          </View>
          <Divider style={styles.divider} />
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Title:</Text>
            <Text style={styles.infoValue}>{lead.title}</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Custom Fields Card - Only shown if custom fields exist */}
      {hasCustomFields && (
        <Card style={styles.card}>
          <Card.Title title="Custom Fields" />
          <Card.Content>
            {customFieldsToDisplay.map((field, index) => (
              <React.Fragment key={field.key}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>{field.label}:</Text>
                  <Text style={styles.infoValue}>{field.value}</Text>
                </View>
                {index < customFieldsToDisplay.length - 1 && <Divider style={styles.divider} />}
              </React.Fragment>
            ))}
          </Card.Content>
        </Card>
      )}

      {/* Tags Card */}
      <Card style={styles.card}>
        <Card.Title title="Tags" />
        <Card.Content>
          <View style={styles.tagsContainer}>
            {lead.tags && lead.tags.length > 0 ? (
              lead.tags.map((tag, index) => (
                <Chip key={index} style={styles.tag}>{tag}</Chip>
              ))
            ) : (
              <Text>No tags</Text>
            )}
          </View>
        </Card.Content>
      </Card>

      {/* Notes Card */}
      <Card style={styles.card}>
        <Card.Title title="Notes" />
        <Card.Content>
          <Text>{lead.notes || 'No notes available'}</Text>
        </Card.Content>
      </Card>

      {/* Additional Information Card */}
      <Card style={styles.card}>
        <Card.Title title="Additional Information" />
        <Card.Content>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Created:</Text>
            <Text style={styles.infoValue}>{formatDate(lead.createdAt)}</Text>
          </View>
          <Divider style={styles.divider} />
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ID:</Text>
            <Text style={styles.infoValue}>{lead.id}</Text>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontWeight: 'bold',
    width: 80,
  },
  infoValue: {
    flex: 1,
  },
  divider: {
    marginVertical: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    marginRight: 8,
    marginBottom: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  errorMessage: {
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
  },
});
