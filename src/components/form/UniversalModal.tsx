import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../services/axiosConfig";
import styles from "./Form.module.css";

interface FieldConfig {
  label: string;
  name: string;
  type: "text" | "number" | "date" | "select" | "tel";
  required?: boolean;
  placeholder?: string;
  options?: { value: string | number; label: string }[];
  step?: string;
}

interface UniversalModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  endpoint: string;
  initialData: any;
  fields: FieldConfig[];
  id?: string;
}

const UniversalModal: React.FC<UniversalModalProps> = ({
  isOpen,
  onClose,
  title,
  endpoint,
  initialData,
  fields,
  id,
}) => {
  const [formData, setFormData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const isEditing = !!id;

  useEffect(() => {
    if (isOpen) {
      if (isEditing) {
        axiosInstance.get(`${endpoint}/${id}/`)
          .then(res => {
            const data = res.data;
            const formattedData = { ...data };
            
            // Formatar dados baseados no tipo do campo esperado
            fields.forEach(field => {
              // Limitar campos de moeda/números decimais a 2 casas após a vírgula
              if (field.type === "number" && field.step === "0.01" && data[field.name] != null) {
                formattedData[field.name] = Number(data[field.name]).toFixed(2);
              }
              // Garantir que dados booleanos (true/false) conversem corretamente com o <select>
              if (field.type === "select" && typeof data[field.name] === "boolean") {
                formattedData[field.name] = data[field.name] ? "true" : "false";
              }
            });

            setFormData(formattedData);
          })
          .catch(err => console.error(err));
      } else {
        setFormData(initialData);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, id, endpoint]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value === "" ? null : value }));
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = isEditing ? `${endpoint}/${id}/` : `${endpoint}/`;
      const method = isEditing ? "put" : "post";
      
      await axiosInstance[method](url, formData);

      localStorage.setItem("message", "Operação realizada com sucesso");
      localStorage.setItem("type", "success");
      onClose();
      window.location.reload();
    } catch (error) {
      localStorage.setItem("message", "Erro na operação");
      localStorage.setItem("type", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div className={styles.form}>
        <button type="button" className={styles.closeButton} onClick={onClose}>&times;</button>
        <form onSubmit={handleSubmit}>
          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>{isEditing ? `Editar ${title}` : `Novo ${title}`}</legend>
            
            {fields.map((field) => (
              <div key={field.name} className={styles.inputGroup}>
                <label className={styles.label}>{field.label}</label>
                {field.type === "select" ? (
                  <select
                    name={field.name}
                    value={formData[field.name] || ""}
                    onChange={handleChange}
                    required={field.required}
                    className={styles.select}
                  >
                    <option value="" disabled>Selecione</option>
                    {field.options?.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    name={field.name}
                    value={formData[field.name] || ""}
                    onChange={handleChange}
                    required={field.required}
                    placeholder={field.placeholder}
                    step={field.step}
                    className={styles.input}
                  />
                )}
              </div>
            ))}

            <button type="submit" className={styles.button} disabled={loading}>
              {loading ? "Processando..." : (isEditing ? "Atualizar" : "Cadastrar")}
            </button>
          </fieldset>
        </form>
      </div>
    </div>
  );
};

export default UniversalModal;