
const express = require('express');
const { Project, User } = require('../models');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all projects with pagination and enriched data
router.get('/', authMiddleware, async (req, res) => {
  try {
    console.log('GET /projects - Fetching projects with relations');
    
    const { page = 1, limit = 10, search, commercialName, clientName } = req.query;
    const offset = (page - 1) * limit;
    
    const whereClause = {};
    if (search) {
      whereClause[require('sequelize').Op.or] = [
        { projectName: { [require('sequelize').Op.iLike]: `%${search}%` } },
        { clientName: { [require('sequelize').Op.iLike]: `%${clientName}%` } }
      ];
    }
    if (commercialName) {
      whereClause.commercialName = { [require('sequelize').Op.iLike]: `%${commercialName}%` };
    }
    if (clientName) {
      whereClause.clientName = { [require('sequelize').Op.iLike]: `%${clientName}%` };
    }

    const { count, rows: projects } = await Project.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'email', 'role']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    console.log(`Found ${projects.length} projects`);

    res.json({
      success: true,
      data: projects,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get project by ID with enriched data
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    console.log(`GET /projects/${req.params.id} - Fetching project with relations`);
    
    const project = await Project.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'email', 'role']
        }
      ]
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Create new project
router.post('/', authMiddleware, requireRole(['admin', 'commercial', 'directeur_commercial']), async (req, res) => {
  try {
    console.log('POST /projects - Creating new project');
    console.log('Body:', req.body);
    
    const projectData = {
      ...req.body,
      createdBy: req.user.id
    };

    console.log('Creating project with data:', projectData);

    const project = await Project.create(projectData);

    const projectWithDetails = await Project.findByPk(project.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['firstName', 'lastName']
        }
      ]
    });

    // Emit Socket.IO event
    const io = req.app.get('io');
    if (io) {
      io.emit('project_created', projectWithDetails);
    }

    console.log('Project created successfully:', project.id);

    res.status(201).json({
      success: true,
      data: projectWithDetails,
      message: 'Project created successfully'
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Update project
router.put('/:id', authMiddleware, requireRole(['admin', 'commercial', 'directeur_commercial']), async (req, res) => {
  try {
    console.log(`PUT /projects/${req.params.id} - Updating project`);
    
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    await project.update(req.body);

    const updatedProject = await Project.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['firstName', 'lastName']
        }
      ]
    });

    // Emit Socket.IO event
    const io = req.app.get('io');
    if (io) {
      io.emit('project_updated', updatedProject);
    }

    console.log('Project updated successfully:', updatedProject.id);

    res.json({
      success: true,
      data: updatedProject
    });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Delete project - Updated to allow admin, directeur_commercial, and commercial roles
router.delete('/:id', authMiddleware, requireRole(['admin', 'directeur_commercial', 'commercial']), async (req, res) => {
  try {
    console.log(`DELETE /projects/${req.params.id} - Deleting project`);
    console.log('User role:', req.user.role);
    
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    await project.destroy();

    // Emit Socket.IO event
    const io = req.app.get('io');
    if (io) {
      io.emit('project_deleted', { id: req.params.id });
    }

    console.log('Project deleted successfully:', req.params.id);

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Generate project PDF
router.post('/:id/pdf', authMiddleware, async (req, res) => {
  try {
    console.log(`POST /projects/${req.params.id}/pdf - Generating PDF`);
    
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // TODO: Implement PDF generation logic
    const pdfUrl = `/pdfs/project-${req.params.id}.pdf`;

    res.json({
      success: true,
      data: { pdfUrl }
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;