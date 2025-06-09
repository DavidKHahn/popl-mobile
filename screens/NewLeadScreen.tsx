import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Button, TextInput, Text, Chip, HelperText, Snackbar } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { leadsApi } from '../api/leadsApi';
import { Lead } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'NewLead'>;

export default function NewLeadScreen({ navigation }: Props) {
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  
  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // UI state
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Access the QueryClient
  const queryClient = useQueryClient();

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

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
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
      
      createLeadMutation.mutate(newLead);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.formContainer}>
          {/* Basic Information */}
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
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
});
