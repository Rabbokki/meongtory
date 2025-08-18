"use client"

import React, { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import AnimalEditModal from "@/components/modals/animal-edit-modal"
import CreateTemplateModal from "@/components/modals/admin/CreateTemplateModal"
import ContractViewModal from "@/components/modals/admin/ContractViewModal"
import ContractGenerationModal from "@/components/modals/admin/ContractGenerationModal"
import EditTemplateModal from "@/components/modals/admin/EditTemplateModal"
import TemplateViewModal from "@/components/modals/admin/TemplateViewModal"
import ContractEditModal from "@/components/modals/admin/ContractEditModal"
import GeneratedContractViewModal from "@/components/modals/admin/GeneratedContractViewModal"
import DashboardTab from "@/components/admin/DashboardTab"
import ProductsTab from "@/components/admin/ProductsTab"
import PetsTab from "@/components/admin/PetsTab"
import AdoptionRequestsTab from "@/components/admin/AdoptionRequestsTab"
import OrdersTab from "@/components/admin/OrdersTab"
import ContractsTab from "@/components/admin/ContractsTab"
import { getBackendUrl } from "@/lib/api"
import { 
  AdminPageProps, 
  AdminPet as Pet,
  AdoptionRequest as AdoptionInquiry
} from "@/types/admin"

// 기존 인터페이스들을 제거하고 import한 타입들을 사용

export default function AdminPage({
  onClose,
  onNavigateToStoreRegistration,
  onNavigateToAnimalRegistration,
  onNavigateToCommunity,
  onUpdatePet,
  isAdmin,
  onAdminLogout,
}: AdminPageProps) {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedPetForEdit, setSelectedPetForEdit] = useState<Pet | null>(null)
  const [showContractModal, setShowContractModal] = useState(false)
  const [selectedContractRequest, setSelectedContractRequest] = useState<AdoptionInquiry | null>(null)
  const [contractTemplates, setContractTemplates] = useState<any[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null)
  const [showContractViewModal, setShowContractViewModal] = useState(false)
  const [showGeneratedContractViewModal, setShowGeneratedContractViewModal] = useState(false)
  const [selectedPetForContract, setSelectedPetForContract] = useState<Pet | null>(null)
  const [isGeneratingContract, setIsGeneratingContract] = useState(false)
  const [generatedContract, setGeneratedContract] = useState<string | null>(null)
  const [generatedContracts, setGeneratedContracts] = useState<any[]>([])
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false)
  const [isLoadingContracts, setIsLoadingContracts] = useState(false)
  const [showCreateTemplateModal, setShowCreateTemplateModal] = useState(false)
  const [showEditTemplateModal, setShowEditTemplateModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<any>(null)
  const [showTemplateViewModal, setShowTemplateViewModal] = useState(false)
  const [selectedTemplateForView, setSelectedTemplateForView] = useState<any>(null)
  const [selectedContractForView, setSelectedContractForView] = useState<any>(null)
  const [showContractEditModal, setShowContractEditModal] = useState(false)
  const [editingContract, setEditingContract] = useState<any>(null)
  const [editedContractContent, setEditedContractContent] = useState("")









  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <CardContent>
            <h2 className="text-2xl font-bold text-red-600 mb-4">접근 권한이 없습니다</h2>
            <p className="text-gray-600 mb-4">관리자만 접근할 수 있는 페이지입니다.</p>
            <Button onClick={onClose}>홈으로 돌아가기</Button>
          </CardContent>
        </Card>
      </div>
    )
  }



  const handleEditPet = (pet: Pet) => {
    setSelectedPetForEdit(pet)
    setShowEditModal(true)
  }

  const handleCloseEditModal = () => {
    setShowEditModal(false)
    setSelectedPetForEdit(null)
  }

  const handleUpdatePet = (updatedPet: Pet) => {
    onUpdatePet(updatedPet)
    handleCloseEditModal()
  }











  const handleShowContractModal = (request: AdoptionInquiry) => {
    setSelectedContractRequest(request)
    setSelectedTemplate(null)
    setGeneratedContract(null)
    setShowContractModal(true)
  }

























  const handleViewOrderDetails = (orderId: number) => {
    // 주문 상세 정보 보기 - 필요시 구현
    console.log('주문 상세 보기:', orderId)
  }


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">관리자 페이지</h1>
            <p className="text-gray-600 mt-2">멍토리 서비스 관리 대시보드</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard">대시보드</TabsTrigger>
            <TabsTrigger value="products">상품관리</TabsTrigger>
            <TabsTrigger value="pets">입양관리</TabsTrigger>
            <TabsTrigger value="inquiries">입양신청</TabsTrigger>
            <TabsTrigger value="orders">주문내역</TabsTrigger>
            <TabsTrigger value="contracts">AI 계약서</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <DashboardTab
              onNavigateToStoreRegistration={onNavigateToStoreRegistration}
              onNavigateToAnimalRegistration={onNavigateToAnimalRegistration}
              onNavigateToCommunity={onNavigateToCommunity}
            />
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <ProductsTab
              onNavigateToStoreRegistration={onNavigateToStoreRegistration}
              onEditProduct={() => {}}
            />
          </TabsContent>

          {/* Pets Tab */}
          <TabsContent value="pets" className="space-y-6">
            <PetsTab
              onNavigateToAnimalRegistration={onNavigateToAnimalRegistration}
              onUpdatePet={handleEditPet}
              onViewContract={() => {}}
            />
          </TabsContent>



          {/* Adoption Requests Tab */}
          <TabsContent value="inquiries" className="space-y-6">
            <AdoptionRequestsTab
              onShowContractModal={handleShowContractModal}
            />
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <OrdersTab />
          </TabsContent>

          {/* AI 계약서 Tab */}
          <TabsContent value="contracts" className="space-y-6">
            <ContractsTab
              onCreateTemplate={() => setShowCreateTemplateModal(true)}
              onEditTemplate={() => {}}
              onViewTemplate={() => {}}
              onViewGeneratedContract={() => {}}
              onEditContract={() => {}}
            />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* 수정 모달 */}
      <AnimalEditModal
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        selectedPet={selectedPetForEdit}
        onUpdatePet={handleUpdatePet}
      />

      {/* 템플릿 생성 모달 */}
      <CreateTemplateModal
        isOpen={showCreateTemplateModal}
        onClose={() => setShowCreateTemplateModal(false)}
        onCreateTemplate={() => {}}
      />
      {/* 모든 모달 컴포넌트들 */}
      <ContractGenerationModal
        isOpen={showContractModal}
        onClose={() => setShowContractModal(false)}
        selectedContractRequest={selectedContractRequest}
        contractTemplates={contractTemplates}
        isLoadingTemplates={isLoadingTemplates}
        selectedTemplate={selectedTemplate}
        setSelectedTemplate={setSelectedTemplate}
        generatedContract={generatedContract}
        isGeneratingContract={isGeneratingContract}
        onGenerateContract={() => {}}
        onDownloadContract={() => {}}
      />

      <EditTemplateModal
        isOpen={showEditTemplateModal}
        onClose={() => setShowEditTemplateModal(false)}
        editingTemplate={editingTemplate}
        onUpdateTemplate={() => {}}
      />

      <TemplateViewModal
        isOpen={showTemplateViewModal}
        onClose={() => {
              setShowTemplateViewModal(false)
              setSelectedTemplateForView(null)
        }}
        selectedTemplate={selectedTemplateForView}
      />

      <ContractEditModal
        isOpen={showContractEditModal}
        onClose={() => {
              setShowContractEditModal(false)
              setEditingContract(null)
              setEditedContractContent("")
        }}
        editingContract={editingContract}
        editedContractContent={editedContractContent}
        setEditedContractContent={setEditedContractContent}
        onUpdateContract={() => {}}
      />

      <GeneratedContractViewModal
        isOpen={showGeneratedContractViewModal}
        onClose={() => {
                    setShowGeneratedContractViewModal(false)
                    setSelectedContractForView(null)
        }}
        selectedContract={selectedContractForView}
        onDownloadContract={() => {}}
      />
    </div>
  )
}
