import CheckboxInput from '@/components/Inputs/CheckboxInput'
import DateInput from '@/components/Inputs/DateInput'
import NumberInput from '@/components/Inputs/NumberInput'
import SelectInput from '@/components/Inputs/SelectInput'
import { Button } from '@/components/ui/button'
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { formatDateInputChange } from '@/lib/methods/formatting'
import { formatDateForInput } from '@/utils/methods'
import { editExpensePersonalized } from '@/utils/mutations/expenses'
import { useMutationWithFeedback } from '@/utils/mutations/general-hook'
import { editRevenuePersonalized } from '@/utils/mutations/revenues'
import { TPayment } from '@/utils/schemas/expenses.schema'
import { PaymentMethods } from '@/utils/select-options'
import { useQueryClient } from '@tanstack/react-query'
import React, { useState } from 'react'

type EditPaymentProps = {
  payment: TPayment
  affectedQueryKey: any[]
}
function EditPayment({ payment, affectedQueryKey }: EditPaymentProps) {
  console.log(payment)
  const queryClient = useQueryClient()
  const [infoHolder, setInfoHolder] = useState<TPayment['pagamentos']>(payment.pagamentos)

  const {
    mutate: handleUpdatePayment,
    isPending,
    isError,
    isSuccess,
  } = useMutationWithFeedback({
    mutationKey: ['edit-expense-payment', payment._id, payment.indexPagamento],
    mutationFn: editExpensePersonalized,
    queryClient: queryClient,
    affectedQueryKey: affectedQueryKey,
  })
  return (
    <DialogContent className="w-[90%] sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Editar Pagamento</DialogTitle>
        <DialogDescription>Atualize as informações do pagamento.</DialogDescription>
      </DialogHeader>
      <div className="flex w-full flex-col items-center gap-2">
        <div className="w-full">
          <NumberInput
            label="VALOR"
            placeholder="Preencha o valor do pagamento..."
            value={infoHolder.valor}
            handleChange={(value) => setInfoHolder((prev) => ({ ...prev, valor: value }))}
            width="100%"
          />
        </div>
        <div className="w-full">
          <SelectInput
            label="MÉTODO DE PAGAMENTO"
            selectedItemLabel="NÃO DEFINIDO"
            options={PaymentMethods}
            value={infoHolder.metodo}
            handleChange={(value) =>
              setInfoHolder((prev) => ({
                ...prev,
                metodo: value,
              }))
            }
            onReset={() => {
              setInfoHolder((prev) => ({
                ...prev,
                metodo: 'UN',
              }))
            }}
            width="100%"
          />
        </div>
        <div className="w-full">
          <DateInput
            label="DATA/PREVISÃO DE PAGAMENTO"
            value={formatDateForInput(infoHolder.dataPagamento)}
            handleChange={(value) =>
              setInfoHolder((prev) => ({
                ...prev,
                dataPagamento: formatDateInputChange(value),
              }))
            }
            width="100%"
          />
        </div>
        <div className="flex w-full items-center justify-center">
          <div className="w-fit">
            <CheckboxInput
              labelFalse="PAGO"
              labelTrue="PAGO"
              checked={infoHolder.efetivado}
              handleChange={(value) => setInfoHolder((prev) => ({ ...prev, efetivado: value }))}
            />
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button
          disabled={isPending}
          onClick={() => {
            // @ts-ignore
            handleUpdatePayment({
              id: payment._id,
              changes: {
                [`pagamentos.${payment.indexPagamento}`]: infoHolder,
              },
            })
          }}
          type="submit"
          className="text-xs"
        >
          SALVAR ALTERAÇÃO
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}

export default EditPayment
