// Ensure all the required properties have proper types
import { useEffect, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAuth } from "../contexts/AuthContext";
import { useProjects } from "../hooks/useProjects";
import Navbar from "../components/Navbar";
import Footer from "../components/layout/Footer";
import { ProjectRecordsList } from "../components/projects/ProjectRecordsList";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { ProjectRecord as BackendProject } from "../services/projects.api.service";

// Define the schema for project records with proper types
const projectSchema = z.object({
  orderNumber: z.string().min(1, { message: "Le numéro de commande est requis" }),
  commercialName: z.string().min(1, { message: "Le nom commercial est requis" }),
  pricedBy: z.string().min(1, { message: "Le nom de la personne qui a chiffré est requis" }),
  clientName: z.string().min(1, { message: "Le nom du client est requis" }),
  projectName: z.string().min(1, { message: "Le nom du projet est requis" }),
  orderDescription: z.string().min(1, { message: "La désignation de commande est requise" }),
  quantity: z.string().min(1, { message: "La quantité est requise" }),
  orderAmount: z.string().min(1, { message: "Le montant de commande est requis" }),
  price: z.string().min(1, { message: "Le prix est requis" }),
  expectedSalesCoefficient: z.string().min(1, { message: "Le coefficient de vente prévisionnel est requis" }),
  effectiveSalesCoefficient: z.string().min(1, { message: "Le coefficient de vente effectif est requis" }),
  poundRate: z.string().min(1, { message: "Le taux de charge en £ est requis" }),
  dollarRate: z.string().min(1, { message: "Le taux de charge en $ est requis" }),
  transportAmount: z.string().min(1, { message: "Le montant du transport est requis" }),
  paymentMethod: z.enum(["virement", "cheque", "en_compte", "espece"], {
    required_error: "La modalité de paiement est requise"
  }),
  effectiveDeliveryDate: z.string().min(1, { message: "La date de livraison effective est requise" }),
  remarks: z.string().optional(),
});

// Export the type for use in other components
export type ProjectRecord = z.infer<typeof projectSchema> & { id: string };

type ProjectFormValues = z.infer<typeof projectSchema>;

const defaultValues: ProjectFormValues = {
  orderNumber: "",
  commercialName: "",
  pricedBy: "",
  clientName: "",
  projectName: "",
  orderDescription: "",
  quantity: "",
  orderAmount: "",
  price: "",
  expectedSalesCoefficient: "",
  effectiveSalesCoefficient: "",
  poundRate: "",
  dollarRate: "",
  transportAmount: "",
  paymentMethod: "virement",
  effectiveDeliveryDate: "",
  remarks: "",
};

export default function ProjectRecords() {
  const { user, hasRole } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState<BackendProject | null>(null);

  // Use the backend API hook
  const { 
    projects, 
    loading, 
    error, 
    createProject, 
    updateProject, 
    deleteProject,
    refetch 
  } = useProjects();

  // Check if user is service_facturation, directeur_commercial, directeur_general, directeur_financier or responsable_achat
  const isBillingService = user?.role === 'service_facturation';
  const isDirectorCommercial = hasRole('directeur_commercial') && !hasRole('admin');
  const isDirectorGeneral = hasRole('directeur_general') && !hasRole('admin');
  const isDirectorFinancier = hasRole('directeur_financier') && !hasRole('admin');
  const isResponsableAchat = hasRole('responsable_achat') && !hasRole('admin');
  
  // Determine if the user can add a new project - Updated to include responsable_achat
  const canAddProject = !isBillingService && !isDirectorCommercial && !isDirectorGeneral && !isDirectorFinancier && !isResponsableAchat;

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues,
  });

  const openNewProjectForm = () => {
    form.reset(defaultValues);
    setCurrentProject(null);
    setIsFormOpen(true);
  };

  const openEditProjectForm = (project: BackendProject) => {
    form.reset({
      orderNumber: project.orderNumber || "",
      commercialName: project.commercialName || "",
      pricedBy: project.pricedBy || "",
      clientName: project.clientName || "",
      projectName: project.projectName || "",
      orderDescription: project.orderDescription || "",
      quantity: project.quantity || "", 
      orderAmount: project.orderAmount?.toString() || "",
      price: project.price?.toString() || "",
      expectedSalesCoefficient: project.expectedSalesCoefficient?.toString() || "",
      effectiveSalesCoefficient: project.effectiveSalesCoefficient?.toString() || "",
      poundRate: project.poundRate?.toString() || "",
      dollarRate: project.dollarRate?.toString() || "",
      transportAmount: project.transportAmount?.toString() || "",
      paymentMethod: project.paymentMethod || "virement",
      effectiveDeliveryDate: project.effectiveDeliveryDate || "",
      remarks: project.remarks || "",
    });
    setCurrentProject(project);
    setIsFormOpen(true);
  };

  const onSubmit = async (data: ProjectFormValues) => {
    try {
      const projectData = {
        orderNumber: data.orderNumber,
        commercialName: data.commercialName,
        pricedBy: data.pricedBy,
        clientName: data.clientName,
        projectName: data.projectName,
        orderDescription: data.orderDescription,
        quantity: data.quantity,
        orderAmount: parseFloat(data.orderAmount),
        price: parseFloat(data.price),
        expectedSalesCoefficient: parseFloat(data.expectedSalesCoefficient),
        effectiveSalesCoefficient: parseFloat(data.effectiveSalesCoefficient),
        poundRate: parseFloat(data.poundRate),
        dollarRate: parseFloat(data.dollarRate),
        transportAmount: parseFloat(data.transportAmount),
        paymentMethod: data.paymentMethod,
        effectiveDeliveryDate: data.effectiveDeliveryDate,
        remarks: data.remarks,
      };

      if (currentProject) {
        // Mise à jour d'un projet existant
        const response = await updateProject(currentProject.id, projectData);
        if (response.success) {
          toast.success("Fiche projet mise à jour avec succès");
          setIsFormOpen(false);
        }
      } else {
        // Création d'un nouveau projet
        const response = await createProject(projectData);
        if (response.success) {
          toast.success("Nouvelle fiche projet créée avec succès");
          setIsFormOpen(false);
        }
      }
    } catch (error) {
      console.error('Error submitting project:', error);
      toast.error("Erreur lors de l'enregistrement du projet");
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      const response = await deleteProject(id);
      if (response.success) {
        toast.success("Fiche projet supprimée avec succès");
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error("Erreur lors de la suppression du projet");
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-systemair-grey">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-16 flex-grow">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">Chargement des projets...</div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-systemair-grey">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-16 flex-grow">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-red-600">Erreur: {error}</div>
            <Button onClick={refetch} className="ml-4">Réessayer</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-systemair-grey">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-16 flex-grow">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-systemair-dark">Fiches Projet</h1>
            {canAddProject && (
              <Button onClick={openNewProjectForm} className="bg-systemair-blue">
                Nouvelle fiche projet
              </Button>
            )}
          </div>
          
          {/* Updated: Show consultation mode message for directeur_financier and responsable_achat */}
          {(isDirectorCommercial || isDirectorGeneral || isDirectorFinancier || isResponsableAchat) && (
            <div className="mb-4 bg-blue-100 text-blue-800 px-4 py-2 rounded-md flex items-center">
              <span>Mode consultation uniquement - Téléchargement PDF disponible</span>
            </div>
          )}
          
          <ProjectRecordsList
            projects={projects}
            onEdit={openEditProjectForm}
            onDelete={handleDeleteProject}
            disableActions={{
              edit: isBillingService || isDirectorCommercial || isDirectorGeneral || isDirectorFinancier || isResponsableAchat,
              delete: isBillingService || isDirectorCommercial || isDirectorGeneral || isDirectorFinancier || isResponsableAchat,
              add: isBillingService || isDirectorCommercial || isDirectorGeneral || isDirectorFinancier || isResponsableAchat
            }}
          />
          
          {/* Keep dialog open only when necessary and for non-billing users */}
          <Dialog open={isFormOpen && canAddProject} onOpenChange={setIsFormOpen}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {currentProject ? "Modifier la fiche projet" : "Nouvelle fiche projet"}
                </DialogTitle>
                <DialogDescription>
                  Remplissez les détails de la fiche projet ci-dessous.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Numéro de commande */}
                    <FormField
                      control={form.control}
                      name="orderNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>N° de commande</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: COM-12345" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Nom Commercial */}
                    <FormField
                      control={form.control}
                      name="commercialName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom Commercial</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Jean Dupont" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Chiffré Par */}
                    <FormField
                      control={form.control}
                      name="pricedBy"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Chiffré Par</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Marie Martin" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Nom Client */}
                    <FormField
                      control={form.control}
                      name="clientName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom Client</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Entreprise XYZ" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Nom Projet */}
                    <FormField
                      control={form.control}
                      name="projectName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom Projet</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Rénovation Bureau" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Désignation Commande */}
                    <FormField
                      control={form.control}
                      name="orderDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Désignation Commande</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Installation climatisation" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Quantité - NOUVEAU CHAMP */}
                    <FormField
                      control={form.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantité</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="Ex: 5" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Montant Commande */}
                    <FormField
                      control={form.control}
                      name="orderAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Montant Commande</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: 15000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Prix */}
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prix</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: 12500" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Coefficient de vente prévisionnel */}
                    <FormField
                      control={form.control}
                      name="expectedSalesCoefficient"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Coef vente prévisionnel</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: 1.2" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Coefficient de vente effectif */}
                    <FormField
                      control={form.control}
                      name="effectiveSalesCoefficient"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Coef vente effectif</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: 1.15" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Taux de charge en £ */}
                    <FormField
                      control={form.control}
                      name="poundRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Taux de charge en £</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: 1.18" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Taux de charge en $ */}
                    <FormField
                      control={form.control}
                      name="dollarRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Taux de charge en $</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: 0.9" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Montant Transport */}
                    <FormField
                      control={form.control}
                      name="transportAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Montant Transport</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: 500" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Modalité de paiement */}
                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Modalité de paiement</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner mode de paiement" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="virement">Virement</SelectItem>
                              <SelectItem value="cheque">Chèque</SelectItem>
                              <SelectItem value="en_compte">En Compte</SelectItem>
                              <SelectItem value="espece">Espèce</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Date de livraison effective */}
                    <FormField
                      control={form.control}
                      name="effectiveDeliveryDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date de livraison effective</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Remarques */}
                    <FormField
                      control={form.control}
                      name="remarks"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Remarques</FormLabel>
                          <FormControl>
                            <Input placeholder="Remarques (optionnel)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                      Annuler
                    </Button>
                    <Button type="submit" className="bg-systemair-blue">
                      {currentProject ? "Mettre à jour" : "Enregistrer"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}