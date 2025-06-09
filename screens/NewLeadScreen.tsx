import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Button, TextInput, Text, Chip, HelperText, Snackbar, Switch, ActivityIndicator, SegmentedButtons, Menu, Divider } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { leadsApi } from '../api/leadsApi';
import { formConfigApi } from '../api/formConfigApi';
import { Lead, FormConfig, FormFieldConfig } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'NewLead'>;

export default function NewLeadScreen({ navigation }: Props) {
  // Form type state
  const [formType, setFormType] = useState<'default' | 'custom'>('default');
  
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  
  // Custom form fields state
  const [customFields, setCustomFields] = useState<Record<string, string>>({});
  const [selectMenuVisible, setSelectMenuVisible] = useState<Record<string, boolean>>({});
  
  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // UI state
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Access the QueryClient
  const queryClient = useQueryClient();

  // Fetch form configuration
  const { data: formConfig, isLoading: isLoadingConfig, isError: isErrorConfig } = useQuery({
    queryKey: ['form-config'],
    queryFn: async () => {
      const response = await formConfigApi.getFormConfig();
      return response.data;
    },
    enabled: formType === 'custom', // Only fetch when custom form is selected
  });

  // Create lead mutation
  const createLeadMutation = useMutation({
    mutationFn: (newLead: Partial<Lead>) => leadsApi.create(newLead),
    onMutate: async (newLead) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['leads'] });
      
      // Snapshot the previous value
      const previousLeads = queryClient.getQueryData<Lead[]>(['leads']);
      
      // Optimistically update the cache
      if (previousLeads) {
        const optimisticLead: Lead = {
          id: `temp-${Date.now()}`, // Temporary ID
          name: newLead.name || '',
          email: newLead.email || '',
          company: newLead.company || '',
          title: newLead.title || '',
          phone: newLead.phone || '',
          tags: newLead.tags || [],
          notes: newLead.notes || '',
          createdAt: new Date().toISOString(),
          ...customFields, // Add custom fields
        };
        
        queryClient.setQueryData(['leads'], [...previousLeads, optimisticLead]);
      }
      
      return { previousLeads };
    },
    onError: (err, newLead, context) => {
      // Revert back to the previous state if there's an error
      if (context?.previousLeads) {
        queryClient.setQueryData(['leads'], context.previousLeads);
      }
      setSnackbarMessage('Failed to create lead. Please try again.');
      setSnackbarVisible(true);
    },
    onSuccess: () => {
      // Invalidate and refetch to get the actual server data
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      setSnackbarMessage('Lead created successfully!');
      setSnackbarVisible(true);
      
      // Navigate back after a short delay
      setTimeout(() => {
        navigation.navigate('LeadList');
      }, 1000);
    },
  });

  // Add a tag
  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  // Remove a tag
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Handle custom field change
  const handleCustomFieldChange = (key: string, value: string) => {
    setCustomFields(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Toggle select menu visibility
  const toggleSelectMenu = (fieldId: string) => {
    setSelectMenuVisible(prev => ({
      ...prev,
      [fieldId]: !prev[fieldId]
    }));
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Validate default fields
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!company.trim()) {
      newErrors.company = 'Company is required';
    }
    
    // Validate custom fields if using custom form
    if (formType === 'custom' && formConfig) {
      formConfig.fields.forEach(field => {
        if (field.required && !customFields[field.key] && !['name', 'email', 'company'].includes(field.key)) {
          newErrors[field.key] = `${field.label} is required`;
        }
      });
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = () => {
    if (validateForm()) {
      const newLead: Partial<Lead> = {
        name,
        email,
        phone,
        company,
        title,
        notes,
        tags,
      };
      
      // Add custom fields if using custom form
      if (formType === 'custom') {
        Object.entries(customFields).forEach(([key, value]) => {
          if (value) {
            newLead[key] = value;
          }
        });
      }
      
      createLeadMutation.mutate(newLead);
    }
  };

  // Render a form field based on its configuration
  const renderFormField = (field: FormFieldConfig) => {
    // Skip fields that are handled separately in the default form
    if (['name', 'email', 'phone', 'company', 'title', 'notes'].includes(field.key)) {
      return null;
    }

    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
        return (
          <View key={field.id}>
            <TextInput
              label={`${field.label}${field.required ? ' *' : ''}`}
              mode="outlined"
              value={customFields[field.key] || ''}
              onChangeText={(value) => handleCustomFieldChange(field.key, value)}
              placeholder={field.placeholder}
              keyboardType={field.type === 'email' ? 'email-address' : field.type === 'phone' ? 'phone-pad' : 'default'}
              error={!!errors[field.key]}
              style={styles.input}
            />
            {errors[field.key] && <HelperText type="error">{errors[field.key]}</HelperText>}
          </View>
        );
      case 'multiline':
        return (
          <View key={field.id}>
            <TextInput
              label={`${field.label}${field.required ? ' *' : ''}`}
              mode="outlined"
              value={customFields[field.key] || ''}
              onChangeText={(value) => handleCustomFieldChange(field.key, value)}
              placeholder={field.placeholder}
              multiline
              numberOfLines={4}
              error={!!errors[field.key]}
              style={styles.input}
            />
            {errors[field.key] && <HelperText type="error">{errors[field.key]}</HelperText>}
          </View>
        );
      case 'select':
        return (
          <View key={field.id}>
            <Menu
              visible={!!selectMenuVisible[field.id]}
              onDismiss={() => toggleSelectMenu(field.id)}
              anchor={
                <TextInput
                  label={`${field.label}${field.required ? ' *' : ''}`}
                  mode="outlined"
                  value={customFields[field.key] || ''}
                  onChangeText={(value) => handleCustomFieldChange(field.key, value)}
                  placeholder="Select an option"
                  error={!!errors[field.key]}
                  style={styles.input}
                  right={<TextInput.Icon icon="menu-down" onPress={() => toggleSelectMenu(field.id)} />}
                  showSoftInputOnFocus={false}
                  onPressIn={() => toggleSelectMenu(field.id)}
                />
              }
            >
              {field.options?.map((option) => (
                <Menu.Item
                  key={option}
                  onPress={() => {
                    handleCustomFieldChange(field.key, option);
                    toggleSelectMenu(field.id);
                  }}
                  title={option}
                />
              ))}
            </Menu>
            {errors[field.key] && <HelperText type="error">{errors[field.key]}</HelperText>}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.formContainer}>
          {/* Form Type Toggle */}
          <View style={styles.formTypeContainer}>
            <Text style={styles.formTypeLabel}>Form Type:</Text>
            <SegmentedButtons
              value={formType}
              onValueChange={(value) => setFormType(value as 'default' | 'custom')}
              buttons={[
                { value: 'default', label: 'Default' },
                { value: 'custom', label: 'Custom' }
              ]}
              style={styles.segmentedButtons}
            />
          </View>
          
          {formType === 'custom' && isLoadingConfig && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" />
              <Text style={styles.loadingText}>Loading custom form...</Text>
            </View>
          )}
          
          {formType === 'custom' && isErrorConfig && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Failed to load custom form. Using default form instead.</Text>
              <Button mode="contained" onPress={() => setFormType('default')} style={styles.errorButton}>
                Switch to Default Form
              </Button>
            </View>
          )}
          
          {/* Personal Information */}
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <TextInput
            label="Name *"
            mode="outlined"
            value={name}
            onChangeText={setName}
            error={!!errors.name}
            style={styles.input}
          />
          {errors.name && <HelperText type="error">{errors.name}</HelperText>}
          
          <TextInput
            label="Email *"
            mode="outlined"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            error={!!errors.email}
            style={styles.input}
          />
          {errors.email && <HelperText type="error">{errors.email}</HelperText>}
          
          <TextInput
            label="Phone"
            mode="outlined"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            style={styles.input}
          />
          
          {/* Company Information */}
          <Text style={styles.sectionTitle}>Company Information</Text>
          
          <TextInput
            label="Company *"
            mode="outlined"
            value={company}
            onChangeText={setCompany}
            error={!!errors.company}
            style={styles.input}
          />
          {errors.company && <HelperText type="error">{errors.company}</HelperText>}
          
          <TextInput
            label="Title"
            mode="outlined"
            value={title}
            onChangeText={setTitle}
            style={styles.input}
          />
          
          {/* Custom Fields */}
          {formType === 'custom' && formConfig && (
            <>
              <Text style={styles.sectionTitle}>Additional Information</Text>
              {formConfig.fields.map(field => renderFormField(field))}
            </>
          )}
          
          {/* Tags */}
          <Text style={styles.sectionTitle}>Tags</Text>
          
          <View style={styles.tagInputContainer}>
            <TextInput
              label="Add tag"
              mode="outlined"
              value={tagInput}
              onChangeText={setTagInput}
              style={styles.tagInput}
              right={
                <TextInput.Icon
                  icon="plus"
                  onPress={addTag}
                  disabled={!tagInput.trim()}
                />
              }
              onSubmitEditing={addTag}
            />
          </View>
          
          <View style={styles.tagsContainer}>
            {tags.map((tag, index) => (
              <Chip
                key={index}
                onClose={() => removeTag(tag)}
                style={styles.tag}
              >
                {tag}
              </Chip>
            ))}
            {tags.length === 0 && (
              <Text style={styles.noTagsText}>No tags added</Text>
            )}
          </View>
          
          {/* Notes */}
          <Text style={styles.sectionTitle}>Notes</Text>
          
          <TextInput
            label="Notes"
            mode="outlined"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            style={styles.input}
          />
          
          {/* Submit Button */}
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={createLeadMutation.isPending}
              disabled={createLeadMutation.isPending}
              style={styles.submitButton}
            >
              Create Lead
            </Button>
            
            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              style={styles.cancelButton}
              disabled={createLeadMutation.isPending}
            >
              Cancel
            </Button>
          </View>
        </View>
      </ScrollView>
      
      {/* Snackbar for feedback */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: 'Dismiss',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
  },
  formTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  formTypeLabel: {
    fontSize: 16,
    marginRight: 16,
  },
  segmentedButtons: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    marginBottom: 12,
  },
  tagInputContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  tagInput: {
    flex: 1,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  tag: {
    margin: 4,
  },
  noTagsText: {
    fontStyle: 'italic',
    color: '#888',
    margin: 4,
  },
  buttonContainer: {
    marginTop: 24,
    marginBottom: 40,
  },
  submitButton: {
    marginBottom: 12,
    paddingVertical: 6,
  },
  cancelButton: {
    paddingVertical: 6,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#ffebee',
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#d32f2f',
    marginBottom: 10,
    textAlign: 'center',
  },
  errorButton: {
    marginTop: 10,
  },
});
