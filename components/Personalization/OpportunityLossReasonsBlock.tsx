import type { TUserSession } from "@/lib/auth/session";
import { useMutationWithFeedback } from "@/utils/mutations/general-hook";
import { createUtil, editUtil } from "@/utils/mutations/utils";
import { useOpportunityLossReasons } from "@/utils/queries/utils";
import type { TOpportunityLossReason } from "@/utils/schemas/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { FiEdit3 } from "react-icons/fi";
import CheckboxInput from "../Inputs/CheckboxInput";
import TextInput from "../Inputs/TextInput";
import ErrorComponent from "../utils/ErrorComponent";
import LoadingComponent from "../utils/LoadingComponent";
import toast from "react-hot-toast";
import TextareaInput from "../Inputs/TextareaInput";
import ResponsiveDialogDrawer from "../utils/ResponsiveDialogDrawer";
import { Trash2 } from "lucide-react";

type OpportunityLossReasonsBlockProps = {
  session: TUserSession;
};

const emptyReason: TOpportunityLossReason = {
  identificador: "OPPORTUNITY_LOSS_REASON",
  ativo: true,
  titulo: "",
  descricao: "",
};

export default function OpportunityLossReasonsBlock({
  session: _session,
}: OpportunityLossReasonsBlockProps) {
  const queryClient = useQueryClient();
  const { data: reasons, queryKey, isLoading, isError, isSuccess } = useOpportunityLossReasons();
  const [newReasonMenuIsOpen, setNewReasonMenuIsOpen] = useState<boolean>(false);
  const [editingReasonId, setEditingReasonId] = useState<string | null>(null);

  const handleOnMutate = async () => {
    await queryClient.cancelQueries({ queryKey: queryKey });
  };

  const handleOnSettle = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKey });
  };

  const { mutate: handleCreateReason, isPending: isCreating } = useMutation({
    mutationKey: ["create-opportunity-loss-reason"],
    mutationFn: createUtil,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKey });
    },
    onSuccess: (data) => {
      toast.success(data);
      setNewReasonMenuIsOpen(false);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKey });
    },
  });

  const { mutate: handleEditReason, isPending: isEditing } = useMutation({
    mutationKey: ["edit-opportunity-loss-reason", editingReasonId],
    mutationFn: editUtil,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKey });
    },
    onSuccess: (data) => {
      toast.success(data);
      setEditingReasonId(null);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKey });
    },
  });

  const editingReason = reasons?.find((reason) => reason._id === editingReasonId);
  return (
    <div className="flex min-h-[450px] w-full flex-col rounded-sm border border-red-500">
      <h1 className="w-full rounded-tl rounded-tr bg-red-500 p-1 text-center text-sm font-bold text-primary-foreground">
        RAZÕES DE PERDA
      </h1>
      <div className="my-1 flex w-full flex-col">
        <p className="w-full text-center text-sm font-light tracking-tighter text-primary/70">
          As razões de perda aqui cadastradas serão utilizadas como opção na solicitação de projeto
          em casos de financiamento, por exemplo.
        </p>
        <p className="w-full text-center text-sm font-light tracking-tighter text-primary/70">
          Se necessário, cadastre uma nova razão de perda no menu inferior.
        </p>
      </div>
      <div className="flex max-h-[600px] w-full grow flex-wrap items-start justify-around gap-2 overflow-y-auto overscroll-y-auto p-2 scrollbar-thin scrollbar-track-primary/10 scrollbar-thumb-primary/30">
        {isLoading ? <LoadingComponent /> : null}
        {isError ? <ErrorComponent msg="Erro ao buscar razões de perda." /> : null}
        {isSuccess ? (
          reasons.length > 0 ? (
            reasons.map((reason) => (
              <div
                key={reason._id}
                className="flex w-full flex-col rounded-md border border-primary/20 bg-background p-3 shadow-sm lg:w-[350px]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${reason.ativo ? "bg-green-500" : "bg-red-500"}`}
                      />
                      <h2 className="text-sm font-bold leading-none tracking-tight text-primary">
                        {reason.titulo}
                      </h2>
                    </div>
                    <p className="text-xs font-light leading-snug tracking-tight text-primary/70">
                      {reason.descricao}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingReasonId(reason._id)}
                      className="rounded-full p-1 text-blue-500 duration-300 hover:bg-blue-500/10"
                      title="Editar razão de perda"
                    >
                      <FiEdit3 />
                    </button>
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  <span
                    className={`rounded-full px-2 py-1 text-[0.65rem] font-bold ${
                      reason.ativo ? "bg-green-500/15 text-green-700" : "bg-red-500/15 text-red-700"
                    }`}
                  >
                    {reason.ativo ? "ATIVA" : "INATIVA"}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="flex w-full grow items-center justify-center py-2 text-center font-medium italic tracking-tight text-primary/70">
              Nenhuma razão de perda encontrada.
            </p>
          )
        ) : null}
      </div>
      <div className="flex w-full items-center justify-end p-2">
        <button
          type="button"
          className="rounded bg-green-500 p-1 px-4 text-sm font-medium text-primary-foreground duration-300 ease-in-out hover:bg-green-600"
          onClick={() => setNewReasonMenuIsOpen(true)}
        >
          NOVA RAZÃO
        </button>
      </div>
      {newReasonMenuIsOpen ? (
        <OpportunityLossReasonMenu
          menuTitle="CADASTRO DE RAZÃO DE PERDA"
          menuDescription="Preencha os campos abaixo para criar uma nova razão de perda."
          menuActionButtonText="CRIAR RAZÃO DE PERDA"
          menuCancelButtonText="CANCELAR"
          initialInfo={emptyReason}
          closeMenu={() => setNewReasonMenuIsOpen(false)}
          commit={(info) => handleCreateReason({ info })}
          commitIsLoading={isCreating}
          callbacks={{ onMutate: handleOnMutate, onSettled: handleOnSettle }}
        />
      ) : null}
      {editingReasonId && editingReason ? (
        <OpportunityLossReasonMenu
          menuTitle="EDITAR RAZÃO DE PERDA"
          menuDescription="Preencha os campos abaixo para editar a razão de perda."
          menuActionButtonText="EDITAR RAZÃO DE PERDA"
          menuCancelButtonText="CANCELAR"
          initialInfo={editingReason}
          closeMenu={() => setEditingReasonId(null)}
          commit={(info) => handleEditReason({ id: editingReasonId, changes: info })}
          commitIsLoading={isEditing}
          callbacks={{ onMutate: handleOnMutate, onSettled: handleOnSettle }}
        />
      ) : null}
    </div>
  );
}

type OpportunityLossReasonMenuProps = {
  menuTitle: string;
  menuDescription: string;
  menuActionButtonText: string;
  menuCancelButtonText: string;
  initialInfo: TOpportunityLossReason;
  closeMenu: () => void;
  commit: (info: TOpportunityLossReason) => void;
  commitIsLoading: boolean;
  callbacks?: {
    onMutate?: () => void;
    onSuccess?: () => void;
    onSettled?: () => void;
    onError?: (error: Error) => void;
  };
};
function OpportunityLossReasonMenu({
  menuTitle,
  menuDescription,
  menuActionButtonText,
  menuCancelButtonText,
  initialInfo,
  closeMenu,
  commit,
  commitIsLoading,
  callbacks,
}: OpportunityLossReasonMenuProps) {
  const [infoHolder, setInfoHolder] = useState<TOpportunityLossReason>(initialInfo);

  return (
    <ResponsiveDialogDrawer
      menuTitle={menuTitle}
      menuDescription={menuDescription}
      closeMenu={closeMenu}
      actionFunction={() => commit(infoHolder)}
      actionIsLoading={commitIsLoading}
      stateIsLoading={false}
      stateError={null}
      menuActionButtonText={menuActionButtonText}
      menuCancelButtonText={menuCancelButtonText}
    >
      <TextInput
        label="TÍTULO"
        placeholder="Preencha um título para a razão de perda..."
        value={infoHolder.titulo}
        handleChange={(value) => setInfoHolder((prev) => ({ ...prev, titulo: value }))}
        width="100%"
      />
      <TextareaInput
        label="DESCRIÇÃO"
        placeholder="Preencha uma descrição para a razão de perda..."
        value={infoHolder.descricao}
        handleChange={(value) => setInfoHolder((prev) => ({ ...prev, descricao: value }))}
      />
      <CheckboxInput
        checked={infoHolder.ativo}
        labelFalse="RAZÃO INATIVA"
        labelTrue="RAZÃO ATIVA"
        handleChange={(value) => setInfoHolder((prev) => ({ ...prev, ativo: value }))}
        justify="justify-start"
        padding="0"
      />
    </ResponsiveDialogDrawer>
  );
}
