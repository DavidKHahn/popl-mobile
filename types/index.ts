export interface Lead {
  id: string;
  name: string;
  email: string;
  company: string;
  title: string;
  phone: string;
  tags: string[];
  notes: string;
  createdAt: string;
  // Custom fields
  leadSource?: string;
  budget?: string;
  timeline?: string;
  [key: string]: any; // Allow for any additional custom fields
}

export interface FormFieldConfig {
  id: string;
  label: string;
  type: 'text' | 'email' | 'phone' | 'multiline' | 'select' | 'date';
  required: boolean;
  key: string;
  options?: string[]; // For select type fields
  placeholder?: string;
  defaultValue?: string;
}

export interface FormConfig {
  id: string;
  name: string;
  description: string;
  fields: FormFieldConfig[];
}
