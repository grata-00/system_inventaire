// import { useState, useEffect } from "react";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import { format } from "date-fns";
// import { fr } from "date-fns/locale";
// import { CalendarIcon, Plus, Save, Bell, CheckCircle, XCircle, Eye, Paperclip } from "lucide-react";
// import { useAuth } from "../contexts/AuthContext";
// import Navbar from "../components/Navbar";
// import Footer from "../components/layout/Footer";
// import { PurchaseRequestsList } from "../components/purchases/PurchaseRequestsList";
// import ApprovedRequestView from "../components/purchases/ApprovedRequestView";
// import PurchaseOrderForm from "../components/purchases/PurchaseOrderForm";
// import PurchaseRequestDetailView from "../components/purchases/PurchaseRequestDetailView";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import { Calendar } from "@/components/ui/calendar";
// import { toast } from "sonner";
// import { cn } from "@/lib/utils";
// import { usePurchaseRequests } from '../hooks/usePurchaseRequests';
// import { usePurchaseOrders } from '../hooks/usePurchaseOrders';
// import PurchaseRequestLogisticsStatusSelector from "@/components/purchases/PurchaseRequestLogisticsStatusSelector";

// // Define the purchase request schema with all required fields
// const purchaseRequestFormSchema = z.object({
//   id: z.string().optional(),
//   requestNumber: z.string().min(1, { message: "Le numéro de demande est requis" }),
//   productName: z.string().min(1, { message: "Le nom du produit est requis" }),
//   projectName: z.string().min(1, { message: "Le nom du projet est requis" }),
//   quantity: z.string().min(1, { message: "La quantité est requise" }),
//   estimatedPrice: z.string().min(1, { message: "Le prix estimé est requis" }),
//   deliveryDate: z.date({
//     required_error: "La date de livraison est requise",
//   }),
//   estimationDate: z.date({
//     required_error: "La date d'estimation est requise",
//   }),
//   purchaseOrderFile: z.string().optional(),
// });

// // Schema pour l'approbation des directeurs
// const directorApprovalSchema = z.object({
//   comment: z.string().optional(),
// });

// type PurchaseRequestFormValues = z.infer<typeof purchaseRequestFormSchema>;
// type DirectorApprovalFormValues = z.infer<typeof directorApprovalSchema>;

// const defaultValues: Partial<PurchaseRequestFormValues> = {
//   requestNumber: "",
//   productName: "",
//   projectName: "",
//   quantity: "",
//   estimatedPrice: "",
//   purchaseOrderFile: "",
// };

// export default function PurchaseRequests() {
//   const { user, hasRole } = useAuth();
//   const [isFormOpen, setIsFormOpen] = useState(false);
//   const [isPurchaseOrderFormOpen, setIsPurchaseOrderFormOpen] = useState(false);
//   const [isApprovedViewOpen, setIsApprovedViewOpen] = useState(false);
//   const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
//   const [isDetailViewOpen, setIsDetailViewOpen] = useState(false);
//   const [selectedRequest, setSelectedRequest] = useState<any>(null);
//   const [approvalAction, setApprovalAction] = useState<'approve' | 'reject' | null>(null);
//   const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  
//   // Get the disableActions from props
//   const { disableActions } = window.history.state || {};

//   const { requests, loading, error, createRequest, directorApproval, approveRequest, updateRequestStatus, transferToLogistics, refetch: refetchPurchaseRequests, updateLogisticsStatus } = usePurchaseRequests();
//   const { purchaseOrders, sendToLogistics } = usePurchaseOrders();

//   const form = useForm<PurchaseRequestFormValues>({
//     resolver: zodResolver(purchaseRequestFormSchema),
//     defaultValues,
//   });

//   const approvalForm = useForm<DirectorApprovalFormValues>({
//     resolver: zodResolver(directorApprovalSchema),
//     defaultValues: { comment: "" },
//   });

//   const openNewRequestForm = () => {
//     const today = new Date();
//     const requestNumber = `PR-${format(today, 'yyyyMMdd')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    
//     form.reset({
//       ...defaultValues,
//       requestNumber,
//       estimationDate: today,
//     });
    
//     setSelectedRequest(null);
//     setIsFormOpen(true);
//   };

//   const openEditRequestForm = (request: any) => {
//     form.reset({
//       id: request.id,
//       requestNumber: request.requestNumber,
//       productName: request.productName || (request.requestedProducts[0]?.name || ''),
//       projectName: request.projectName,
//       quantity: request.quantity.toString(),
//       estimatedPrice: (request.estimatedPrice || request.totalEstimatedCost).toString(),
//       deliveryDate: request.deliveryDate ? new Date(request.deliveryDate) : new Date(),
//       estimationDate: request.estimationDate ? new Date(request.estimationDate) : new Date(),
//       purchaseOrderFile: request.purchaseOrderFile || "",
//     });
//     setSelectedRequest(request);
//     setIsFormOpen(true);
//   };

//   const openApprovedView = (request: any) => {
//     setSelectedRequest(request);
//     setIsApprovedViewOpen(true);
//   };

//   const openPurchaseOrderForm = (request: any) => {
//     setSelectedRequest(request);
//     setIsPurchaseOrderFormOpen(true);
//   };

//   const openApprovalDialog = (request: any, action: 'approve' | 'reject') => {
//     setSelectedRequest(request);
//     setApprovalAction(action);
//     approvalForm.reset({ comment: "" });
//     setIsApprovalDialogOpen(true);
//   };

//   const openDetailView = (request: any) => {
//     setSelectedRequestId(request.id);
//     setSelectedRequest(request);
//     setIsDetailViewOpen(true);
//   };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       if (file.type !== 'application/pdf') {
//         toast.error("Veuillez sélectionner un fichier PDF");
//         return;
//       }
      
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         form.setValue("purchaseOrderFile", reader.result as string);
//         toast.success("Fichier PDF ajouté avec succès");
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const onSubmit = async (data: PurchaseRequestFormValues) => {
//     if (!user) return;

//     try {
//       const requestData = {
//         projectName: data.projectName,
//         productName: data.productName,
//         requestedProducts: [{ name: data.productName, quantity: parseInt(data.quantity) }],
//         totalEstimatedCost: parseFloat(data.estimatedPrice),
//         quantity: parseInt(data.quantity),
//         estimatedPrice: parseFloat(data.estimatedPrice),
//         deliveryDate: data.deliveryDate.toISOString(),
//         estimationDate: data.estimationDate.toISOString(),
//         priority: 'Normale' as const,
//         purchaseOrderFile: data.purchaseOrderFile, // Ajout du fichier PDF
//       };

//       const response = await createRequest(requestData);
      
//       if (response.success) {
//         toast.success("Nouvelle demande d'achat créée avec succès");
//         setIsFormOpen(false);
//       } else {
//         toast.error(response.error || "Erreur lors de la création de la demande");
//       }
//     } catch (error) {
//       console.error('Error creating request:', error);
//       toast.error("Erreur lors de la création de la demande");
//     }
//   };

//   const onApprovalSubmit = async (data: DirectorApprovalFormValues) => {
//     if (!selectedRequest || !approvalAction) return;

//     try {
//       const approved = approvalAction === 'approve';
      
//       if (!approved && !data.comment?.trim()) {
//         toast.error("Un commentaire est obligatoire lors du refus d'une demande");
//         return;
//       }

//       const response = await directorApproval(
//         selectedRequest.id, 
//         approved, 
//         data.comment?.trim() || undefined
//       );
      
//       if (response.success) {
//         toast.success(
//           approved 
//             ? "Demande d'achat approuvée avec succès" 
//             : "Demande d'achat rejetée"
//         );
//         setIsApprovalDialogOpen(false);
//         setSelectedRequest(null);
//         setApprovalAction(null);
        
//         // Actualiser les données pour refléter le changement de statut
//         // L'actualisation est déjà gérée dans directorApproval
//       } else {
//         toast.error(response.error || "Erreur lors du traitement de l'approbation");
//       }
//     } catch (error) {
//       console.error('Error processing approval:', error);
//       toast.error("Erreur lors du traitement de l'approbation");
//     }
//   };

//   const handleApprove = async (request: any, approved: boolean, comment: string) => {
//     if (!user) return;
    
//     try {
//       if (approved) {
//         const response = await approveRequest(request.id, comment);
//         if (response.success) {
//           toast.success("Demande d'achat approuvée avec succès");
//         } else {
//           toast.error(response.error || "Erreur lors de l'approbation");
//         }
//       } else {
//         const response = await updateRequestStatus(request.id, 'Rejetée', comment);
//         if (response.success) {
//           toast.success("Demande d'achat rejetée");
//         } else {
//           toast.error(response.error || "Erreur lors du rejet");
//         }
//       }
//     } catch (error) {
//       console.error('Error handling approval:', error);
//       toast.error("Erreur lors du traitement de la demande");
//     }
//   };

//   const isDirector = user && (
//     user.role === 'directeur_general' || 
//     user.role === 'directeur_commercial' || 
//     user.role === 'directeur_financier'
//   );

//   const isPurchasingManager = user && user.role === 'responsable_achat';

//   const canCreateRequest = user && (
//     user.role === 'commercial' || 
//     user.role === 'admin' ||
//     user.role === 'directeur_general' || 
//     user.role === 'directeur_financier'
//   );

//   const isDirectorCommercial = user && user.role === 'directeur_commercial';

//   // Filter requests based on user role
//   const filteredRequests = (() => {
//     if (user?.role === 'responsable_achat') {
//       // Affiche toutes les demandes, même transférées à la logistique (respecte la consigne !)
//       return requests;
//     }

//     if (isDirector) {
//       return requests;
//     }
    
//     if (user?.role === 'commercial') {
//       return requests.filter(request => request.requestedBy === user.id);
//     }

//     return requests;
//   })();

//   // Filtrer les demandes en attente d'approbation pour les directeurs
//   const pendingApprovalRequests = isDirector 
//     ? requests.filter(request => {
//         if (request.status !== 'En attente' && request.status !== 'En cours d\'approbation') {
//           return false;
//         }
        
//         const approvals = request.directorApprovals || {};
//         const userRole = user?.role;
        
//         // Vérifier si ce directeur n'a pas encore donné son approbation
//         return !approvals[userRole as keyof typeof approvals];
//       })
//     : [];
  
//   // ---- NOUVEAU : Handler pour transfert à la logistique ---
//   const handleSendToLogistics = async (requestId: string) => {
//     try {
//       const response = await transferToLogistics(requestId);
//       if (!response.success) {
//         toast.error("Erreur lors du transfert à la logistique : " + (response.error ?? ""));
//         return;
//       }
//       toast.success("Demande transférée au service logistique !");
//     } catch (e) {
//       toast.error("Erreur lors du transfert à la logistique.");
//     }
//   };

//   // Affichage côté logistique :
//   const isLogistics = user && user.role === 'logistique';
//   // Les demandes à afficher côté logistique :
//   const LOGISTICS_REQUEST_STATUSES = [
//     "À traiter (logistique)",
//     "En traitement",
//     "Expédiée",
//     "Livrée"
//   ];

//   const logisticsRequests = isLogistics
//     ? requests.filter(
//         (r) => LOGISTICS_REQUEST_STATUSES.includes(r.status)
//       )
//     : [];

//   // Handler pour mise à jour du statut (logistique UI)
//   const handleLogisticsStatusChange = async (request: any, newStatus: string) => {
//     const resp = await updateLogisticsStatus(request.id, newStatus);
//     if (resp.success) {
//       toast.success("Statut mis à jour !");
//       // Forcer le rafraîchissement :
//       await refetchPurchaseRequests();
//       // Mise à jour locale (si modale ouverte sur cette demande)
//       if (selectedRequestId === request.id) {
//         const refreshed = requests.find(r => r.id === request.id);
//         if (refreshed) setSelectedRequest(refreshed);
//       }
//     } else {
//       toast.error(resp.error || "Erreur lors de la mise à jour du statut.");
//     }
//   };

//   useEffect(() => {
//     if (selectedRequestId && requests) {
//       const upToDateRequest = requests.find(r => r.id === selectedRequestId);
//       if (upToDateRequest) setSelectedRequest(upToDateRequest);
//     }
//   }, [requests, selectedRequestId]);

//   return (
//     <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-systemair-grey">
//       <Navbar />
      
//       <div className="container mx-auto px-4 pt-24 pb-16 flex-grow">
//         <div className="max-w-6xl mx-auto">
//           {/* Dashboard d'approbation pour les directeurs */}
//           {isDirector && pendingApprovalRequests.length > 0 && (
//             <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
//               <div className="flex items-center gap-2 mb-4">
//                 <Bell className="h-5 w-5 text-yellow-600" />
//                 <h2 className="text-lg font-semibold text-yellow-800">
//                   Demandes en attente de votre approbation ({pendingApprovalRequests.length})
//                 </h2>
//               </div>
              
//               <div className="space-y-4">
//                 {pendingApprovalRequests.map((request) => (
//                   <div key={request.id} className="bg-white rounded-lg p-4 border border-yellow-200">
//                     <div className="flex justify-between items-start">
//                       <div>
//                         <h3 className="font-medium text-gray-900">{request.requestNumber}</h3>
//                         <p className="text-sm text-gray-600">
//                           Projet: {request.projectName} | Produit: {request.productName}
//                         </p>
//                         <p className="text-sm text-gray-600">
//                           Commercial: {request.commercialName} | Montant: {request.estimatedPrice || request.totalEstimatedCost}€
//                         </p>
//                       </div>
//                       <div className="flex gap-2">
//                         <Button
//                           size="sm"
//                           variant="outline"
//                           onClick={() => openDetailView(request)}
//                         >
//                           <Eye className="h-4 w-4 mr-1" />
//                           Voir détails
//                         </Button>
//                         <Button
//                           size="sm"
//                           onClick={() => openApprovalDialog(request, 'approve')}
//                           className="bg-green-600 hover:bg-green-700 text-white"
//                         >
//                           <CheckCircle className="h-4 w-4 mr-1" />
//                           Approuver
//                         </Button>
//                         <Button
//                           size="sm"
//                           variant="destructive"
//                           onClick={() => openApprovalDialog(request, 'reject')}
//                         >
//                           <XCircle className="h-4 w-4 mr-1" />
//                           Refuser
//                         </Button>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           <div className="mb-8 flex justify-between items-center">
//             <h1 className="text-3xl font-bold text-systemair-dark">Demandes d'Achat</h1>
            
//             {canCreateRequest && !isDirectorCommercial && (
//               <Button onClick={openNewRequestForm} className="bg-systemair-blue">
//                 <Plus className="mr-2 h-4 w-4" />
//                 Nouvelle demande d'achat
//               </Button>
//             )}
            
//             {isDirectorCommercial && (
//               <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-md flex items-center">
//                 <span>Mode consultation uniquement</span>
//               </div>
//             )}
//           </div>
          
//           {loading ? (
//             <div className="bg-white rounded-lg shadow-md p-8 text-center">
//               <p className="text-gray-500">Chargement des demandes d'achat...</p>
//             </div>
//           ) : error ? (
//             <div className="bg-red-50 border border-red-200 rounded-lg p-4">
//               <p className="text-red-600">{error}</p>
//             </div>
//           ) : (
//             <PurchaseRequestsList 
//               requests={filteredRequests}
//               onEdit={openEditRequestForm}
//               onDelete={() => {}}
//               onApprove={handleApprove}
//               onAddPurchaseOrder={openPurchaseOrderForm}
//               onUpdateDelivery={() => {}}
//               onComplete={() => {}}
//               onViewApproved={openApprovedView}
//               onViewDetails={openDetailView}
//               disableActions={isDirectorCommercial ? { add: true, edit: true, delete: true } : disableActions}
//             />
//           )}
          
//           {/* Dialog pour la création/modification de demande */}
//           <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
//             <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
//               <DialogHeader>
//                 <DialogTitle>
//                   {selectedRequest ? "Modifier la demande d'achat" : "Nouvelle demande d'achat"}
//                 </DialogTitle>
//                 <DialogDescription>
//                   Remplissez les détails de la demande d'achat ci-dessous. Le nom du commercial sera automatiquement ajouté.
//                 </DialogDescription>
//               </DialogHeader>
              
//               <Form {...form}>
//                 <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <FormField
//                       control={form.control}
//                       name="requestNumber"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>N° de demande</FormLabel>
//                           <FormControl>
//                             <Input readOnly {...field} />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
                    
//                     <div className="bg-blue-50 p-3 rounded-lg">
//                       <FormLabel>Commercial</FormLabel>
//                       <p className="text-sm font-medium text-blue-800">
//                         {user?.firstName} {user?.lastName}
//                       </p>
//                       <p className="text-xs text-blue-600">
//                         Ce nom sera automatiquement enregistré avec la demande
//                       </p>
//                     </div>
                    
//                     <FormField
//                       control={form.control}
//                       name="productName"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Nom du produit</FormLabel>
//                           <FormControl>
//                             <Input placeholder="Nom du produit" {...field} />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
                    
//                     <FormField
//                       control={form.control}
//                       name="projectName"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Nom du projet</FormLabel>
//                           <FormControl>
//                             <Input placeholder="Nom du projet" {...field} />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
                    
//                     <FormField
//                       control={form.control}
//                       name="quantity"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Quantité</FormLabel>
//                           <FormControl>
//                             <Input placeholder="ex: 10" {...field} />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
                    
//                     <FormField
//                       control={form.control}
//                       name="estimatedPrice"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Prix estimé (€)</FormLabel>
//                           <FormControl>
//                             <Input placeholder="ex: 1000" {...field} />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
                    
//                     <FormField
//                       control={form.control}
//                       name="estimationDate"
//                       render={({ field }) => (
//                         <FormItem className="flex flex-col">
//                           <FormLabel>Date d'estimation</FormLabel>
//                           <Popover>
//                             <PopoverTrigger asChild>
//                               <FormControl>
//                                 <Button
//                                   variant="outline"
//                                   className={cn(
//                                     "w-full pl-3 text-left font-normal",
//                                     !field.value && "text-muted-foreground"
//                                   )}
//                                 >
//                                   {field.value ? (
//                                     format(field.value, "P", { locale: fr })
//                                   ) : (
//                                     <span>Choisir une date</span>
//                                   )}
//                                   <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
//                                 </Button>
//                               </FormControl>
//                             </PopoverTrigger>
//                             <PopoverContent className="w-auto p-0" align="start">
//                               <Calendar
//                                 mode="single"
//                                 selected={field.value}
//                                 onSelect={field.onChange}
//                                 initialFocus
//                                 className={cn("p-3 pointer-events-auto")}
//                               />
//                             </PopoverContent>
//                           </Popover>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
                    
//                     <FormField
//                       control={form.control}
//                       name="deliveryDate"
//                       render={({ field }) => (
//                         <FormItem className="flex flex-col">
//                           <FormLabel>Date de livraison souhaitée</FormLabel>
//                           <Popover>
//                             <PopoverTrigger asChild>
//                               <FormControl>
//                                 <Button
//                                   variant="outline"
//                                   className={cn(
//                                     "w-full pl-3 text-left font-normal",
//                                     !field.value && "text-muted-foreground"
//                                   )}
//                                 >
//                                   {field.value ? (
//                                     format(field.value, "P", { locale: fr })
//                                   ) : (
//                                     <span>Choisir une date</span>
//                                   )}
//                                   <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
//                                 </Button>
//                               </FormControl>
//                             </PopoverTrigger>
//                             <PopoverContent className="w-auto p-0" align="start">
//                               <Calendar
//                                 mode="single"
//                                 selected={field.value}
//                                 onSelect={field.onChange}
//                                 initialFocus
//                                 className={cn("p-3 pointer-events-auto")}
//                               />
//                             </PopoverContent>
//                           </Popover>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                   </div>
                  
//                   {/* Nouveau champ pour l'upload du bon de commande PDF */}
//                   <FormItem>
//                     <FormLabel>Bon de commande (PDF) - Optionnel</FormLabel>
//                     <div className="flex items-center gap-4">
//                       <Input
//                         id="purchase-order-file"
//                         type="file"
//                         accept=".pdf"
//                         onChange={handleFileChange}
//                         className="hidden"
//                       />
//                       <Button
//                         type="button"
//                         variant="outline"
//                         onClick={() => document.getElementById("purchase-order-file")?.click()}
//                       >
//                         <Paperclip className="mr-2 h-4 w-4" />
//                         Joindre un fichier PDF
//                       </Button>
//                       {form.watch("purchaseOrderFile") && (
//                         <span className="text-sm text-green-600">
//                           Fichier PDF sélectionné
//                         </span>
//                       )}
//                     </div>
//                     <p className="text-xs text-gray-500 mt-1">
//                       Vous pouvez joindre un bon de commande PDF à cette demande. Ce fichier sera accessible aux directeurs et au responsable d'achat.
//                     </p>
//                   </FormItem>
                  
//                   <DialogFooter>
//                     <Button variant="outline" type="button" onClick={() => setIsFormOpen(false)}>
//                       Annuler
//                     </Button>
//                     <Button type="submit" className="bg-systemair-blue">
//                       <Save className="mr-2 h-4 w-4" />
//                       {selectedRequest ? "Mettre à jour" : "Enregistrer"}
//                     </Button>
//                   </DialogFooter>
//                 </form>
//               </Form>
//             </DialogContent>
//           </Dialog>

//           {/* Dialog pour l'approbation/rejet des directeurs */}
//           <Dialog open={isApprovalDialogOpen} onOpenChange={setIsApprovalDialogOpen}>
//             <DialogContent className="sm:max-w-md">
//               <DialogHeader>
//                 <DialogTitle>
//                   {approvalAction === 'approve' ? 'Approuver la demande' : 'Refuser la demande'}
//                 </DialogTitle>
//                 <DialogDescription>
//                   {approvalAction === 'approve' 
//                     ? 'Confirmez-vous l\'approbation de cette demande d\'achat ?'
//                     : 'Veuillez indiquer la raison du refus (obligatoire).'
//                   }
//                 </DialogDescription>
//               </DialogHeader>
              
//               <Form {...approvalForm}>
//                 <form onSubmit={approvalForm.handleSubmit(onApprovalSubmit)} className="space-y-4">
//                   <FormField
//                     control={approvalForm.control}
//                     name="comment"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>
//                           {approvalAction === 'approve' ? 'Commentaire (optionnel)' : 'Raison du refus (obligatoire)'}
//                         </FormLabel>
//                         <FormControl>
//                           <Textarea 
//                             placeholder={
//                               approvalAction === 'approve' 
//                                 ? "Commentaire optionnel..." 
//                                 : "Veuillez expliquer pourquoi vous refusez cette demande..."
//                             }
//                             {...field} 
//                           />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
                  
//                   <DialogFooter>
//                     <Button 
//                       variant="outline" 
//                       type="button" 
//                       onClick={() => setIsApprovalDialogOpen(false)}
//                     >
//                       Annuler
//                     </Button>
//                     <Button 
//                       type="submit" 
//                       className={approvalAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
//                     >
//                       {approvalAction === 'approve' ? (
//                         <>
//                           <CheckCircle className="mr-2 h-4 w-4" />
//                           Approuver
//                         </>
//                       ) : (
//                         <>
//                           <XCircle className="mr-2 h-4 w-4" />
//                           Refuser
//                         </>
//                       )}
//                     </Button>
//                   </DialogFooter>
//                 </form>
//               </Form>
//             </DialogContent>
//           </Dialog>
          
//           {/* Dialog pour voir les détails */}
//           <Dialog open={isDetailViewOpen} onOpenChange={setIsDetailViewOpen}>
//             <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
//               <DialogHeader>
//                 <DialogTitle>
//                   Détails de la demande d'achat
//                 </DialogTitle>
//                 <DialogDescription>
//                   Informations complètes de la demande d'achat avec bon de commande
//                 </DialogDescription>
//               </DialogHeader>
              
//               {selectedRequest && (
//                 <PurchaseRequestDetailView
//                   request={selectedRequest}
//                   isPurchasingManager={isPurchasingManager}
//                   onSendToLogistics={handleSendToLogistics}
//                 />
//               )}
              
//               <DialogFooter className="mt-6">
//                 <Button variant="outline" onClick={() => setIsDetailViewOpen(false)}>
//                   Fermer
//                 </Button>
//               </DialogFooter>
//             </DialogContent>
//           </Dialog>
          
//           {/* Autres dialogs existants */}
//           <Dialog open={isApprovedViewOpen} onOpenChange={setIsApprovedViewOpen}>
//             <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
//               <DialogHeader>
//                 <DialogTitle>
//                   Détails de la demande approuvée
//                 </DialogTitle>
//                 <DialogDescription>
//                   Cette demande a été approuvée et un bon de commande a été créé automatiquement.
//                 </DialogDescription>
//               </DialogHeader>
              
//               {selectedRequest && (
//                 <ApprovedRequestView request={selectedRequest} />
//               )}
              
//               <DialogFooter className="mt-6">
//                 <Button variant="outline" onClick={() => setIsApprovedViewOpen(false)}>
//                   Fermer
//                 </Button>
//               </DialogFooter>
//             </DialogContent>
//           </Dialog>
          
//           <Dialog open={isPurchaseOrderFormOpen} onOpenChange={setIsPurchaseOrderFormOpen}>
//             <DialogContent className="sm:max-w-3xl">
//               <DialogHeader>
//                 <DialogTitle>
//                   Bon de commande
//                 </DialogTitle>
//                 <DialogDescription>
//                   Bon de commande généré automatiquement pour cette demande approuvée.
//                 </DialogDescription>
//               </DialogHeader>
              
//               {selectedRequest && (
//                 <PurchaseOrderForm 
//                   request={selectedRequest} 
//                   onSubmit={() => {}}
//                   onCancel={() => setIsPurchaseOrderFormOpen(false)}
//                   readOnly={true}
//                 />
//               )}
//             </DialogContent>
//           </Dialog>
//         </div>
//       </div>
      
//       {/* Bloc LOGISTIQUE EN BAS DE PAGE */}
//       {isLogistics && (
//         <div className="mb-8">
//           <h2 className="text-xl font-bold mb-4">Demandes à traiter (Logistique)</h2>
//           {logisticsRequests.length === 0 ? (
//             <div className="p-4 text-gray-500">Aucune demande à traiter.</div>
//           ) : (
//             <div className="space-y-4">
//               {logisticsRequests.map((req) => (
//                 <div
//                   key={req.id}
//                   className="bg-white rounded-lg p-4 border flex justify-between items-center"
//                 >
//                   <div>
//                     <h3 className="font-medium">{req.requestNumber}</h3>
//                     <div className="text-sm text-gray-700">
//                       {req.projectName} - {req.productName} | <span className="font-semibold">{req.status}</span>
//                     </div>
//                   </div>
//                   {/* Composant de modification du statut pour logistique */}
//                   <div>
//                     <PurchaseRequestLogisticsStatusSelector
//                       request={req}
//                       possibleStatuses={["À traiter (logistique)", "En traitement", "Expédiée", "Livrée"]}
//                       onStatusUpdated={() => handleLogisticsStatusChange(req, req.status)}
//                     />
//                     {/* Correction : le composant doit bien rappeler handleLogisticsStatusChange */}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       )}
      
//       <Footer />
//     </div>
//   );
// }
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon, Plus, Save, Bell, CheckCircle, XCircle, Eye, Paperclip } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/layout/Footer";
import { PurchaseRequestsList } from "../components/purchases/PurchaseRequestsList";
import ApprovedRequestView from "../components/purchases/ApprovedRequestView";
import PurchaseOrderForm from "../components/purchases/PurchaseOrderForm";
import PurchaseRequestDetailView from "../components/purchases/PurchaseRequestDetailView";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { usePurchaseRequests } from '../hooks/usePurchaseRequests';
import { usePurchaseOrders } from '../hooks/usePurchaseOrders';
import PurchaseRequestLogisticsStatusSelector from "@/components/purchases/PurchaseRequestLogisticsStatusSelector";

// Define the purchase request schema with all required fields
const purchaseRequestFormSchema = z.object({
  id: z.string().optional(),
  requestNumber: z.string().min(1, { message: "Le numéro de demande est requis" }),
  productName: z.string().min(1, { message: "Le nom du produit est requis" }),
  projectName: z.string().min(1, { message: "Le nom du projet est requis" }),
  quantity: z.string().min(1, { message: "La quantité est requise" }),
  estimatedPrice: z.string().min(1, { message: "Le prix estimé est requis" }),
  deliveryDate: z.date({
    required_error: "La date de livraison est requise",
  }),
  estimationDate: z.date({
    required_error: "La date d'estimation est requise",
  }),
  purchaseOrderFile: z.string().optional(),
});

// Schema pour l'approbation des directeurs
const directorApprovalSchema = z.object({
  comment: z.string().optional(),
});

type PurchaseRequestFormValues = z.infer<typeof purchaseRequestFormSchema>;
type DirectorApprovalFormValues = z.infer<typeof directorApprovalSchema>;

const defaultValues: Partial<PurchaseRequestFormValues> = {
  requestNumber: "",
  productName: "",
  projectName: "",
  quantity: "",
  estimatedPrice: "",
  purchaseOrderFile: "",
};

export default function PurchaseRequests() {
  const { user, hasRole } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPurchaseOrderFormOpen, setIsPurchaseOrderFormOpen] = useState(false);
  const [isApprovedViewOpen, setIsApprovedViewOpen] = useState(false);
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject' | null>(null);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  
  // Get the disableActions from props
  const { disableActions } = window.history.state || {};

  const { requests, loading, error, createRequest, directorApproval, approveRequest, updateRequestStatus, transferToLogistics, refetch: refetchPurchaseRequests, updateLogisticsStatus } = usePurchaseRequests();
  const { purchaseOrders, sendToLogistics } = usePurchaseOrders();

  const form = useForm<PurchaseRequestFormValues>({
    resolver: zodResolver(purchaseRequestFormSchema),
    defaultValues,
  });

  const approvalForm = useForm<DirectorApprovalFormValues>({
    resolver: zodResolver(directorApprovalSchema),
    defaultValues: { comment: "" },
  });

  const openNewRequestForm = () => {
    const today = new Date();
    const requestNumber = `PR-${format(today, 'yyyyMMdd')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    
    form.reset({
      ...defaultValues,
      requestNumber,
      estimationDate: today,
    });
    
    setSelectedRequest(null);
    setIsFormOpen(true);
  };

  const openEditRequestForm = (request: any) => {
    form.reset({
      id: request.id,
      requestNumber: request.requestNumber,
      productName: request.productName || (request.requestedProducts[0]?.name || ''),
      projectName: request.projectName,
      quantity: request.quantity.toString(),
      estimatedPrice: (request.estimatedPrice || request.totalEstimatedCost).toString(),
      deliveryDate: request.deliveryDate ? new Date(request.deliveryDate) : new Date(),
      estimationDate: request.estimationDate ? new Date(request.estimationDate) : new Date(),
      purchaseOrderFile: request.purchaseOrderFile || "",
    });
    setSelectedRequest(request);
    setIsFormOpen(true);
  };

  const openApprovedView = (request: any) => {
    setSelectedRequest(request);
    setIsApprovedViewOpen(true);
  };

  const openPurchaseOrderForm = (request: any) => {
    setSelectedRequest(request);
    setIsPurchaseOrderFormOpen(true);
  };

  const openApprovalDialog = (request: any, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setApprovalAction(action);
    approvalForm.reset({ comment: "" });
    setIsApprovalDialogOpen(true);
  };

  const openDetailView = (request: any) => {
    setSelectedRequestId(request.id);
    setSelectedRequest(request);
    setIsDetailViewOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error("Veuillez sélectionner un fichier PDF");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue("purchaseOrderFile", reader.result as string);
        toast.success("Fichier PDF ajouté avec succès");
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: PurchaseRequestFormValues) => {
    if (!user) return;

    try {
      const requestData = {
        projectName: data.projectName,
        productName: data.productName,
        requestedProducts: [{ name: data.productName, quantity: parseInt(data.quantity) }],
        totalEstimatedCost: parseFloat(data.estimatedPrice),
        quantity: parseInt(data.quantity),
        estimatedPrice: parseFloat(data.estimatedPrice),
        deliveryDate: data.deliveryDate.toISOString(),
        estimationDate: data.estimationDate.toISOString(),
        priority: 'Normale' as const,
        purchaseOrderFile: data.purchaseOrderFile, // Ajout du fichier PDF
      };

      const response = await createRequest(requestData);
      
      if (response.success) {
        toast.success("Nouvelle demande d'achat créée avec succès");
        setIsFormOpen(false);
      } else {
        toast.error(response.error || "Erreur lors de la création de la demande");
      }
    } catch (error) {
      console.error('Error creating request:', error);
      toast.error("Erreur lors de la création de la demande");
    }
  };

  const onApprovalSubmit = async (data: DirectorApprovalFormValues) => {
    if (!selectedRequest || !approvalAction) return;

    try {
      const approved = approvalAction === 'approve';
      
      if (!approved && !data.comment?.trim()) {
        toast.error("Un commentaire est obligatoire lors du refus d'une demande");
        return;
      }

      const response = await directorApproval(
        selectedRequest.id, 
        approved, 
        data.comment?.trim() || undefined
      );
      
      if (response.success) {
        toast.success(
          approved 
            ? "Demande d'achat approuvée avec succès" 
            : "Demande d'achat rejetée"
        );
        setIsApprovalDialogOpen(false);
        setSelectedRequest(null);
        setApprovalAction(null);
        
        // Actualiser les données pour refléter le changement de statut
        // L'actualisation est déjà gérée dans directorApproval
      } else {
        toast.error(response.error || "Erreur lors du traitement de l'approbation");
      }
    } catch (error) {
      console.error('Error processing approval:', error);
      toast.error("Erreur lors du traitement de l'approbation");
    }
  };

  const handleApprove = async (request: any, approved: boolean, comment: string) => {
    if (!user) return;
    
    try {
      if (approved) {
        const response = await approveRequest(request.id, comment);
        if (response.success) {
          toast.success("Demande d'achat approuvée avec succès");
        } else {
          toast.error(response.error || "Erreur lors de l'approbation");
        }
      } else {
        const response = await updateRequestStatus(request.id, 'Rejetée', comment);
        if (response.success) {
          toast.success("Demande d'achat rejetée");
        } else {
          toast.error(response.error || "Erreur lors du rejet");
        }
      }
    } catch (error) {
      console.error('Error handling approval:', error);
      toast.error("Erreur lors du traitement de la demande");
    }
  };

  const isDirector = user && (
    user.role === 'directeur_general' || 
    user.role === 'directeur_commercial' || 
    user.role === 'directeur_financier'
  );

  const isPurchasingManager = user && user.role === 'responsable_achat';

  // Updated: Only commercial and admin can create requests, not directeur_general or directeur_financier
  const canCreateRequest = user && (
    user.role === 'commercial' || 
    user.role === 'admin'
  );

  const isDirectorCommercial = user && user.role === 'directeur_commercial';

  // Filter requests based on user role
  const filteredRequests = (() => {
    if (user?.role === 'responsable_achat') {
      // Affiche toutes les demandes, même transférées à la logistique (respecte la consigne !)
      return requests;
    }

    if (isDirector) {
      return requests;
    }
    
    if (user?.role === 'commercial') {
      return requests.filter(request => request.requestedBy === user.id);
    }

    return requests;
  })();

  // Filtrer les demandes en attente d'approbation pour les directeurs
  const pendingApprovalRequests = isDirector 
    ? requests.filter(request => {
        if (request.status !== 'En attente' && request.status !== 'En cours d\'approbation') {
          return false;
        }
        
        const approvals = request.directorApprovals || {};
        const userRole = user?.role;
        
        // Vérifier si ce directeur n'a pas encore donné son approbation
        return !approvals[userRole as keyof typeof approvals];
      })
    : [];
  
  // ---- NOUVEAU : Handler pour transfert à la logistique ---
  const handleSendToLogistics = async (requestId: string) => {
    try {
      const response = await transferToLogistics(requestId);
      if (!response.success) {
        toast.error("Erreur lors du transfert à la logistique : " + (response.error ?? ""));
        return;
      }
      toast.success("Demande transférée au service logistique !");
    } catch (e) {
      toast.error("Erreur lors du transfert à la logistique.");
    }
  };

  // Affichage côté logistique :
  const isLogistics = user && user.role === 'logistique';
  // Les demandes à afficher côté logistique :
  const LOGISTICS_REQUEST_STATUSES = [
    "À traiter (logistique)",
    "En traitement",
    "Expédiée",
    "Livrée"
  ];

  const logisticsRequests = isLogistics
    ? requests.filter(
        (r) => LOGISTICS_REQUEST_STATUSES.includes(r.status)
      )
    : [];

  // Handler pour mise à jour du statut (logistique UI)
  const handleLogisticsStatusChange = async (request: any, newStatus: string) => {
    const resp = await updateLogisticsStatus(request.id, newStatus);
    if (resp.success) {
      toast.success("Statut mis à jour !");
      // Forcer le rafraîchissement :
      await refetchPurchaseRequests();
      // Mise à jour locale (si modale ouverte sur cette demande)
      if (selectedRequestId === request.id) {
        const refreshed = requests.find(r => r.id === request.id);
        if (refreshed) setSelectedRequest(refreshed);
      }
    } else {
      toast.error(resp.error || "Erreur lors de la mise à jour du statut.");
    }
  };

  useEffect(() => {
    if (selectedRequestId && requests) {
      const upToDateRequest = requests.find(r => r.id === selectedRequestId);
      if (upToDateRequest) setSelectedRequest(upToDateRequest);
    }
  }, [requests, selectedRequestId]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-systemair-grey">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-16 flex-grow">
        <div className="max-w-6xl mx-auto">
          {/* Dashboard d'approbation pour les directeurs */}
          {isDirector && pendingApprovalRequests.length > 0 && (
            <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Bell className="h-5 w-5 text-yellow-600" />
                <h2 className="text-lg font-semibold text-yellow-800">
                  Demandes en attente de votre approbation ({pendingApprovalRequests.length})
                </h2>
              </div>
              
              <div className="space-y-4">
                {pendingApprovalRequests.map((request) => (
                  <div key={request.id} className="bg-white rounded-lg p-4 border border-yellow-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{request.requestNumber}</h3>
                        <p className="text-sm text-gray-600">
                          Projet: {request.projectName} | Produit: {request.productName}
                        </p>
                        <p className="text-sm text-gray-600">
                          Commercial: {request.commercialName} | Montant: {request.estimatedPrice || request.totalEstimatedCost}€
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDetailView(request)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Voir détails
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => openApprovalDialog(request, 'approve')}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approuver
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => openApprovalDialog(request, 'reject')}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Refuser
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mb-8 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-systemair-dark">Demandes d'Achat</h1>
            
            {canCreateRequest && !isDirectorCommercial && (
              <Button onClick={openNewRequestForm} className="bg-systemair-blue">
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle demande d'achat
              </Button>
            )}
            
            {(isDirectorCommercial || (user && (user.role === 'directeur_general' || user.role === 'directeur_financier'))) && (
              <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-md flex items-center">
                <span>Mode consultation uniquement</span>
              </div>
            )}
          </div>
          
          {loading ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-500">Chargement des demandes d'achat...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{error}</p>
            </div>
          ) : (
            <PurchaseRequestsList 
              requests={filteredRequests}
              onEdit={openEditRequestForm}
              onDelete={() => {}}
              onApprove={handleApprove}
              onAddPurchaseOrder={openPurchaseOrderForm}
              onUpdateDelivery={() => {}}
              onComplete={() => {}}
              onViewApproved={openApprovedView}
              onViewDetails={openDetailView}
              disableActions={
                (isDirectorCommercial || (user && (user.role === 'directeur_general' || user.role === 'directeur_financier'))) 
                  ? { add: true, edit: true, delete: true } 
                  : disableActions
              }
            />
          )}
          
          {/* Dialog pour la création/modification de demande */}
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {selectedRequest ? "Modifier la demande d'achat" : "Nouvelle demande d'achat"}
                </DialogTitle>
                <DialogDescription>
                  Remplissez les détails de la demande d'achat ci-dessous. Le nom du commercial sera automatiquement ajouté.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="requestNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>N° de demande</FormLabel>
                          <FormControl>
                            <Input readOnly {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <FormLabel>Commercial</FormLabel>
                      <p className="text-sm font-medium text-blue-800">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-blue-600">
                        Ce nom sera automatiquement enregistré avec la demande
                      </p>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="productName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom du produit</FormLabel>
                          <FormControl>
                            <Input placeholder="Nom du produit" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="projectName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom du projet</FormLabel>
                          <FormControl>
                            <Input placeholder="Nom du projet" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantité</FormLabel>
                          <FormControl>
                            <Input placeholder="ex: 10" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="estimatedPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prix estimé (€)</FormLabel>
                          <FormControl>
                            <Input placeholder="ex: 1000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="estimationDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Date d'estimation</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "P", { locale: fr })
                                  ) : (
                                    <span>Choisir une date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                                className={cn("p-3 pointer-events-auto")}
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="deliveryDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Date de livraison souhaitée</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "P", { locale: fr })
                                  ) : (
                                    <span>Choisir une date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                                className={cn("p-3 pointer-events-auto")}
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Nouveau champ pour l'upload du bon de commande PDF */}
                  <FormItem>
                    <FormLabel>Bon de commande (PDF) - Optionnel</FormLabel>
                    <div className="flex items-center gap-4">
                      <Input
                        id="purchase-order-file"
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("purchase-order-file")?.click()}
                      >
                        <Paperclip className="mr-2 h-4 w-4" />
                        Joindre un fichier PDF
                      </Button>
                      {form.watch("purchaseOrderFile") && (
                        <span className="text-sm text-green-600">
                          Fichier PDF sélectionné
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Vous pouvez joindre un bon de commande PDF à cette demande. Ce fichier sera accessible aux directeurs et au responsable d'achat.
                    </p>
                  </FormItem>
                  
                  <DialogFooter>
                    <Button variant="outline" type="button" onClick={() => setIsFormOpen(false)}>
                      Annuler
                    </Button>
                    <Button type="submit" className="bg-systemair-blue">
                      <Save className="mr-2 h-4 w-4" />
                      {selectedRequest ? "Mettre à jour" : "Enregistrer"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          {/* Dialog pour l'approbation/rejet des directeurs */}
          <Dialog open={isApprovalDialogOpen} onOpenChange={setIsApprovalDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {approvalAction === 'approve' ? 'Approuver la demande' : 'Refuser la demande'}
                </DialogTitle>
                <DialogDescription>
                  {approvalAction === 'approve' 
                    ? 'Confirmez-vous l\'approbation de cette demande d\'achat ?'
                    : 'Veuillez indiquer la raison du refus (obligatoire).'
                  }
                </DialogDescription>
              </DialogHeader>
              
              <Form {...approvalForm}>
                <form onSubmit={approvalForm.handleSubmit(onApprovalSubmit)} className="space-y-4">
                  <FormField
                    control={approvalForm.control}
                    name="comment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {approvalAction === 'approve' ? 'Commentaire (optionnel)' : 'Raison du refus (obligatoire)'}
                        </FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder={
                              approvalAction === 'approve' 
                                ? "Commentaire optionnel..." 
                                : "Veuillez expliquer pourquoi vous refusez cette demande..."
                            }
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      type="button" 
                      onClick={() => setIsApprovalDialogOpen(false)}
                    >
                      Annuler
                    </Button>
                    <Button 
                      type="submit" 
                      className={approvalAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                    >
                      {approvalAction === 'approve' ? (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Approuver
                        </>
                      ) : (
                        <>
                          <XCircle className="mr-2 h-4 w-4" />
                          Refuser
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          
          {/* Dialog pour voir les détails */}
          <Dialog open={isDetailViewOpen} onOpenChange={setIsDetailViewOpen}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  Détails de la demande d'achat
                </DialogTitle>
                <DialogDescription>
                  Informations complètes de la demande d'achat avec bon de commande
                </DialogDescription>
              </DialogHeader>
              
              {selectedRequest && (
                <PurchaseRequestDetailView
                  request={selectedRequest}
                  isPurchasingManager={isPurchasingManager}
                  onSendToLogistics={handleSendToLogistics}
                />
              )}
              
              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={() => setIsDetailViewOpen(false)}>
                  Fermer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {/* Autres dialogs existants */}
          <Dialog open={isApprovedViewOpen} onOpenChange={setIsApprovedViewOpen}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  Détails de la demande approuvée
                </DialogTitle>
                <DialogDescription>
                  Cette demande a été approuvée et un bon de commande a été créé automatiquement.
                </DialogDescription>
              </DialogHeader>
              
              {selectedRequest && (
                <ApprovedRequestView request={selectedRequest} />
              )}
              
              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={() => setIsApprovedViewOpen(false)}>
                  Fermer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isPurchaseOrderFormOpen} onOpenChange={setIsPurchaseOrderFormOpen}>
            <DialogContent className="sm:max-w-3xl">
              <DialogHeader>
                <DialogTitle>
                  Bon de commande
                </DialogTitle>
                <DialogDescription>
                  Bon de commande généré automatiquement pour cette demande approuvée.
                </DialogDescription>
              </DialogHeader>
              
              {selectedRequest && (
                <PurchaseOrderForm 
                  request={selectedRequest} 
                  onSubmit={() => {}}
                  onCancel={() => setIsPurchaseOrderFormOpen(false)}
                  readOnly={true}
                />
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Bloc LOGISTIQUE EN BAS DE PAGE */}
      {isLogistics && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Demandes à traiter (Logistique)</h2>
          {logisticsRequests.length === 0 ? (
            <div className="p-4 text-gray-500">Aucune demande à traiter.</div>
          ) : (
            <div className="space-y-4">
              {logisticsRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white rounded-lg p-4 border flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-medium">{req.requestNumber}</h3>
                    <div className="text-sm text-gray-700">
                      {req.projectName} - {req.productName} | <span className="font-semibold">{req.status}</span>
                    </div>
                  </div>
                  {/* Composant de modification du statut pour logistique */}
                  <div>
                    <PurchaseRequestLogisticsStatusSelector
                      request={req}
                      possibleStatuses={["À traiter (logistique)", "En traitement", "Expédiée", "Livrée"]}
                      onStatusUpdated={() => handleLogisticsStatusChange(req, req.status)}
                    />
                    {/* Correction : le composant doit bien rappeler handleLogisticsStatusChange */}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      <Footer />
    </div>
  );
}