
import { apiService } from './api.service';

export interface ProjectRecord {
  id: string;
  orderNumber?: string;
  commercialName: string;
  pricedBy?: string;
  clientName: string;
  projectName: string;
  orderDescription?: string;
  quantity?: string;
  orderAmount?: number;
  price?: number;
  expectedSalesCoefficient?: number;
  effectiveSalesCoefficient?: number;
  poundRate?: number;
  dollarRate?: number;
  transportAmount?: number;
  paymentMethod?: 'virement' | 'cheque' | 'en_compte' | 'espece';
  effectiveDeliveryDate?: string;
  remarks?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

export type CreateProjectData = Omit<ProjectRecord, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>;
export type UpdateProjectData = Partial<CreateProjectData>;

export const projectsApiService = {
  // Get all projects
  getProjects: async () => {
    try {
      const response = await apiService.get('/projects');
      return {
        success: true,
        data: response.data || []
      };
    } catch (error) {
      console.error('Error fetching projects:', error);
      return {
        success: false,
        error: 'Erreur lors de la récupération des projets',
        data: []
      };
    }
  },

  // Get project by ID
  getProject: async (id: string) => {
    try {
      const response = await apiService.get(`/projects/${id}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching project:', error);
      return {
        success: false,
        error: 'Erreur lors de la récupération du projet'
      };
    }
  },

  // Create new project
  createProject: async (projectData: CreateProjectData) => {
    try {
      const response = await apiService.post('/projects', projectData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error creating project:', error);
      return {
        success: false,
        error: 'Erreur lors de la création du projet'
      };
    }
  },

  // Update project
  updateProject: async (id: string, projectData: UpdateProjectData) => {
    try {
      const response = await apiService.put(`/projects/${id}`, projectData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error updating project:', error);
      return {
        success: false,
        error: 'Erreur lors de la mise à jour du projet'
      };
    }
  },

  // Delete project
  deleteProject: async (id: string) => {
    try {
      await apiService.delete(`/projects/${id}`);
      return {
        success: true
      };
    } catch (error) {
      console.error('Error deleting project:', error);
      return {
        success: false,
        error: 'Erreur lors de la suppression du projet'
      };
    }
  }
};