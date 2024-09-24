import { categories } from "../data/categories";
import DatePicker from "react-date-picker";
import "react-date-picker/dist/DatePicker.css";
import "react-calendar/dist/Calendar.css";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { DraftExpense, Value } from "../types";
import ErrorMessage from "./ErrorMessage";
import { useBudget } from "../hooks/useBudget";

export default function ExpenseForm() {
    const [expense, setExpense] = useState<DraftExpense>({
        amount: 0,
        expenseName: "",
        category: "",
        date: new Date(),
    });

    const [error, setError] = useState("");
    const [previousAmount, setPreviousAmount] = useState(0);
    const { dispatch, state, remainingBudget } = useBudget();

    useEffect(() => {
        if (state.editingId) {
            const editingExpense = state.expenses.filter(
                (currentExpense) => currentExpense.id === state.editingId
            )[0];

            setExpense(editingExpense);
            setPreviousAmount(editingExpense.amount);
        }
    }, [state.editingId]);

    const handleChange = (
        e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        const isAmountField = ["amount"].includes(name);

        setExpense({
            ...expense,
            [name]: isAmountField ? +value : value,
        });
    };

    const handleChangeDate = (value: Value) => {
        setExpense({
            ...expense,
            date: value,
        });
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        // Validar
        if (Object.values(expense).includes("")) {
            setError("Todos los campos son obligatorios");
            return;
        }

        // Validar que el gasto no sea mayor al presupuesto
        if (expense.amount - previousAmount > remainingBudget) {
            setError("El gasto supera el presupuesto");
            return;
        }

        // Agregar o actualizar el gasto
        if (state.editingId) {
            dispatch({
                type: "update-expense",
                payload: {
                    expense: { id: state.editingId, ...expense },
                },
            });
        } else {
            dispatch({
                type: "add-expense",
                payload: {
                    expense: expense,
                },
            });
        }

        // Limpiar el formulario
        setExpense({
            amount: 0,
            expenseName: "",
            category: "",
            date: new Date(),
        });

        setPreviousAmount(0);
    };

    return (
        <form className="space-y-5" onSubmit={handleSubmit}>
            <legend className="uppercase text-center text-2xl font-black border-b-4 border-blue-500 py-2">
                {state.editingId ? "Actualizar Gasto" : "Registrar Gasto"}
            </legend>

            {error && <ErrorMessage>{error}</ErrorMessage>}

            <div className="flex flex-col gap-2">
                <label htmlFor="expenseName" className="text-xl">
                    Nombre del Gasto:
                </label>
                <input
                    type="text"
                    id="expenseName"
                    name="expenseName"
                    placeholder="Añade el Nombre del Gasto"
                    className="bg-slate-100 p-2"
                    value={expense.expenseName}
                    onChange={handleChange}
                />
            </div>

            <div className="flex flex-col gap-2">
                <label htmlFor="amount" className="text-xl">
                    Cantidad del Gasto:
                </label>
                <input
                    type="number"
                    id="amount"
                    name="amount"
                    placeholder="Añade la Cantidad del Gasto: ej. 300"
                    className="bg-slate-100 p-2"
                    value={expense.amount}
                    onChange={handleChange}
                />
            </div>

            <div className="flex flex-col gap-2">
                <label htmlFor="category" className="text-xl">
                    Categoría del Gasto:
                </label>
                <select
                    id="category"
                    name="category"
                    className="bg-slate-100 p-2"
                    value={expense.category}
                    onChange={handleChange}
                >
                    <option value="" disabled>
                        -- Selecciona una Categoría --
                    </option>

                    {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex flex-col gap-2">
                <label htmlFor="date" className="text-xl">
                    Fecha del Gasto:
                </label>
                <DatePicker
                    className="bg-slate-100 p-2 border-0"
                    value={expense.date}
                    onChange={handleChangeDate}
                />
            </div>

            <input
                type="submit"
                className="bg-blue-600 cursor-pointer w-full p-2 text-white uppercase font-bold rounded-lg"
                value={state.editingId ? "Actualizar Gasto" : "Registrar Gasto"}
            />
        </form>
    );
}
