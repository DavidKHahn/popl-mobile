import { FormConfig } from '../types';
import { api } from './api';

export const formConfigApi = {
  getFormConfig: () => api.get<FormConfig>('/form-config'),
};
