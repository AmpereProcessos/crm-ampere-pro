import SelectWithImages from "@/components/Inputs/SelectWithImages";
import TextInput from "@/components/Inputs/TextInput";
import ControlPricingUnit from "@/components/PricingMethods/ControlPricingUnit";
import type { TUserSession } from "@/lib/auth/session";
import { variablesAlias } from "@/utils/pricing/helpers";
import {
  getMethodologyIssues,
  usePricingMethodEditor,
} from "@/utils/pricing/usePricingMethodEditor";
import { useMutationWithFeedback } from "@/utils/mutations/general-hook";
import { createPricingMethod } from "@/utils/mutations/pricing-methods";
import { usePartnersSimplified } from "@/utils/queries/partners";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { VscChromeClose } from "react-icons/vsc";

const ALLOWED_VARIABLES = variablesAlias.map((v) => v.value as string);

type NewPricingMethodProps = {
  session: TUserSession;
  closeModal: () => void;
};
function NewPricingMethod({ session, closeModal }: NewPricingMethodProps) {
  const queryClient = useQueryClient();
  const { data: partners } = usePartnersSimplified();
  const { methodology, actions } = usePricingMethodEditor({
    nome: "",
    idParceiro: session.user.idParceiro || "",
    itens: [],
    autor: {
      id: session.user.id,
      nome: session.user.nome,
      avatar_url: session.user.avatar_url,
    },
    dataInsercao: new Date().toISOString(),
  });
  const { mutate: handleCreatePricingMethod, isPending } = useMutationWithFeedback({
    mutationKey: ["create-pricing-method"],
    mutationFn: createPricingMethod,
    affectedQueryKey: ["pricing-methods"],
    queryClient: queryClient,
  });

  const issues = getMethodologyIssues(methodology, ALLOWED_VARIABLES);

  function handleSubmit() {
    if (issues.length > 0) return toast.error(issues[0]);
    // @ts-ignore
    handleCreatePricingMethod({ info: methodology });
  }

  return (
    <div
      id="defaultModal"
      className="fixed bottom-0 left-0 right-0 top-0 z-100 bg-[rgba(0,0,0,.85)]"
    >
      <div className="fixed left-[50%] top-[50%] z-100 h-[95%] w-[90%] translate-x-[-50%] translate-y-[-50%] rounded-md bg-background p-[10px] lg:w-[95%]">
        <div className="flex h-full flex-col font-Inter">
          <div className="flex flex-col items-center justify-between border-b border-primary/30 px-2 pb-2 text-lg lg:flex-row">
            <h3 className="text-xl font-bold text-primary  ">NOVA METODOLOGIA DE PRECIFICAÇÃO</h3>
            <button
              onClick={() => closeModal()}
              type="button"
              className="flex items-center justify-center rounded-lg p-1 duration-300 ease-linear hover:scale-105 hover:bg-red-200"
            >
              <VscChromeClose style={{ color: "red" }} />
            </button>
          </div>
          <div className="flex h-full grow flex-col gap-y-2 overflow-y-auto overscroll-y-auto p-2 py-1 scrollbar-thin scrollbar-track-primary/10 scrollbar-thumb-primary/30">
            <div className="my-5 flex flex-col">
              <p className="text-primary/70">
                Construa metodologias de precificação a serem aplicadas ao seus kits.
              </p>
              <p className="text-primary/70">
                Crie unidades de preço para composição da sua precificação. Utilize{" "}
                <strong className="text-[#15599a]">variáveis</strong>, aplique{" "}
                <strong className="text-[#15599a]">condições</strong> , e tenha flexibilidade na
                criação de fórmulas de <strong className="text-[#15599a]">cálculo de custo.</strong>
              </p>
            </div>
            <div className="flex w-full flex-col items-center gap-2 lg:flex-row">
              <div className="w-full lg:w-1/2">
                <TextInput
                  label="NOME DA METODOLOGIA DE PRECIFICAÇÃO"
                  value={methodology.nome}
                  placeholder="Preencha aqui o nome da metodologia de precificação..."
                  handleChange={(value) => actions.setName(value)}
                  width="100%"
                />
              </div>
              <div className="w-full lg:w-1/2">
                <SelectWithImages
                  label="VISIBILIDADE DE PARCEIRO"
                  value={methodology.idParceiro || null}
                  options={
                    partners?.map((p) => ({
                      id: p._id,
                      value: p._id,
                      label: p.nome,
                      url: p.logo_url || undefined,
                    })) || []
                  }
                  resetOptionLabel="TODOS"
                  handleChange={(value) => actions.setPartner(value)}
                  onReset={() => actions.setPartner(null)}
                  width="100%"
                />
              </div>
            </div>
            <ControlPricingUnit methodology={methodology} actions={actions} />
            <div className="flex w-full flex-col items-end gap-1">
              {issues.length > 0 ? (
                <p className="text-xs text-primary/50">
                  {issues.length} pendência(s) — {issues[0]}
                </p>
              ) : null}
              <button
                disabled={isPending || issues.length > 0}
                className="rounded bg-black p-1 px-4 text-sm font-medium text-primary-foreground duration-300 ease-in-out hover:bg-primary/70 disabled:cursor-not-allowed disabled:bg-primary/30 disabled:text-primary-foreground/70"
                onClick={handleSubmit}
              >
                CRIAR METODOLOGIA
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewPricingMethod;
