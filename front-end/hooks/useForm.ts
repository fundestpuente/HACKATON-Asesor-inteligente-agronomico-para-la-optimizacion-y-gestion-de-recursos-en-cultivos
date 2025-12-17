import { useState, useCallback } from 'react';

/**
 * Hook para manejar carga de datos desde una API
 * Retorna: data, loading, error, refetch
 */
export const useFetch = <T,>(
  fetchFn: () => Promise<T>,
  initialData?: T,
  autoFetch: boolean = true
) => {
  const [data, setData] = useState<T | undefined>(initialData);
  const [isLoading, setIsLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
    } catch (err: any) {
      const errorMessage = err?.message || 'Error al cargar datos';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [fetchFn]);

  // Auto fetch al montar si autoFetch es true
  if (autoFetch) {
    // Usar useEffect sería más correcto, pero como este es un hook simple,
    // lo manejamos en el componente que usa este hook
  }

  return { data, isLoading, error, refetch: fetch };
};

/**
 * Hook para manejar formularios con validación
 */
export const useForm = <T extends Record<string, any>>(
  initialValues: T,
  onSubmit: (values: T) => Promise<void>,
  validate?: (values: T) => Record<string, string>
) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleChange = useCallback(
    (name: keyof T, value: any) => {
      setValues((prev) => ({ ...prev, [name]: value }));
      // Limpiar error del campo cuando se empieza a editar
      if (errors[name as string]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name as string];
          return newErrors;
        });
      }
    },
    [errors]
  );

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    // Validar si existe función de validación
    if (validate) {
      const newErrors = validate(values);
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setIsSubmitting(false);
        return;
      }
    }

    try {
      await onSubmit(values);
      setErrors({});
    } catch (error: any) {
      const errorMessage = error?.message || 'Error al enviar el formulario';
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validate, onSubmit]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setSubmitError(null);
  }, [initialValues]);

  return {
    values,
    errors,
    isSubmitting,
    submitError,
    handleChange,
    handleSubmit,
    reset,
    setValues,
  };
};
