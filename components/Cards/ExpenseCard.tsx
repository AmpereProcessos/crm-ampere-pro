import type { TUserSession } from '@/lib/auth/session';
import { useState } from 'react';
import { FaTag } from 'react-icons/fa';
import { MdEdit } from 'react-icons/md';

import { formatToMoney } from '@/lib/methods/formatting';
import { TExpenseDTOSimplified } from '@/utils/schemas/expenses.schema';
import EditExpense from '../Modals/Expenses/EditExpense';

type ExpenseCardProps = {
  expense: TExpenseDTOSimplified;
  session: TUserSession;
};
function ExpenseCard({ expense, session }: ExpenseCardProps) {
  const [editModal, setEditModal] = useState<{ id: string | null; isOpen: boolean }>({ id: null, isOpen: false });
  return (
    <div className='flex w-full flex-col gap-2 rounded-sm border border-primary/50 p-2'>
      <div className='flex w-full flex-col items-center justify-between lg:flex-row'>
        <div className='flex w-full items-center justify-start gap-2 lg:w-fit lg:grow'>
          <h1 className='text-[0.65rem] font-bold tracking-tight text-primary/80 lg:text-xs'>{expense.titulo}</h1>
          <button
            onClick={() => setEditModal({ id: expense._id, isOpen: true })}
            className='flex items-center justify-center rounded-full border border-primary/90 bg-primary/10p-1 text-primary/90'
          >
            <MdEdit size={10} />
            <p className='text-xxs'>EDITAR</p>
          </button>
          <div className='hidden grow flex-wrap items-center gap-2 lg:flex'>
            {expense.categorias.length > 0 ? (
              expense.categorias.map((item, index) => (
                <div key={index} className='flex items-center gap-1 rounded-md border border-blue-600 bg-blue-50 px-2 py-0.5 text-center shadow-md'>
                  <FaTag size={12} color='rgb(37,99,235)' />
                  <p className='text-[0.6rem] font-medium leading-none tracking-tight text-blue-600'>{item}</p>
                </div>
              ))
            ) : (
              <p className='text-[0.6rem] font-medium leading-none tracking-tight text-primary/70'>SEM CATEGORIAS DEFINIDAS</p>
            )}
          </div>
        </div>
        <h1 className='rounded-lg bg-black px-2 py-0.5 text-center text-[0.65rem] font-bold text-primary-foreground lg:py-1'>
          {formatToMoney(expense.total)}
        </h1>
      </div>

      {editModal.id && editModal.isOpen ? (
        <EditExpense expenseId={expense._id} session={session} closeModal={() => setEditModal({ id: null, isOpen: false })} />
      ) : null}
    </div>
  );
}

export default ExpenseCard;
