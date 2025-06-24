
import { useState, useEffect } from 'react';
import { projectsApiService, ProjectRecord } from '../services/projects.api.service';

export const useProjects = () => {
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching projects...');
      const response = await projectsApiService.getProjects();
      
      if (response.success && response.data) {
        console.log('Projects received:', response.data);
        setProjects(response.data);
      } else {
        console.error('API response error:', response.error);
        setError(response.error || 'Erreur lors du chargement des projets');
      }
    } catch (err: any) {
      console.error('Erreur lors de la récupération des projets:', err);
      setError(err.message || 'Erreur lors du chargement des projets');
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (projectData: Omit<ProjectRecord, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => {
    try {
      console.log('Creating project...');
      const response = await projectsApiService.createProject(projectData);
      
      if (response.success) {
        console.log('Project created successfully');
        await fetchProjects();
        return response;
      } else {
        console.error('Create project error:', response.error);
        setError(response.error || 'Erreur lors de la création du projet');
        return response;
      }
    } catch (err: any) {
      console.error('Erreur lors de la création du projet:', err);
      setError(err.message || 'Erreur lors de la création du projet');
      return { success: false, error: err.message };
    }
  };

  const updateProject = async (id: string, projectData: Partial<Omit<ProjectRecord, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>>) => {
    try {
      console.log('Updating project:', id);
      const response = await projectsApiService.updateProject(id, projectData);
      
      if (response.success) {
        console.log('Project updated successfully');
        await fetchProjects();
        return response;
      } else {
        console.error('Update project error:', response.error);
        setError(response.error || 'Erreur lors de la mise à jour du projet');
        return response;
      }
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour du projet:', err);
      setError(err.message || 'Erreur lors de la mise à jour du projet');
      return { success: false, error: err.message };
    }
  };

  const deleteProject = async (id: string) => {
    try {
      console.log('Deleting project:', id);
      const response = await projectsApiService.deleteProject(id);
      
      if (response.success) {
        console.log('Project deleted successfully');
        await fetchProjects();
        return response;
      } else {
        console.error('Delete project error:', response.error);
        setError(response.error || 'Erreur lors de la suppression du projet');
        return response;
      }
    } catch (err: any) {
      console.error('Erreur lors de la suppression du projet:', err);
      setError(err.message || 'Erreur lors de la suppression du projet');
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return {
    projects,
    loading,
    error,
    refetch: fetchProjects,
    createProject,
    updateProject,
    deleteProject
  };
};
