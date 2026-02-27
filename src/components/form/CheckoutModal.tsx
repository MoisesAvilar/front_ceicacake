import React, { useState, useEffect } from "react";
import axiosInstance from "../../services/axiosConfig";
import styles from "./Form.module.css";
import { FaTrash, FaPlus } from "react-icons/fa";

interface Client {
  id: number;
  name: string;
}

interface Product {
  value: string;
  label: string;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  products: Product[];
  onSuccess: () => void;
  editIds?: number[];
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  clients,
  products,
  onSuccess,
  editIds,
}) => {
  const [customer, setCustomer] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("PENDENTE");
  const [originalDate, setOriginalDate] = useState<string | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [deletedItems, setDeletedItems] = useState<number[]>([]);
  const [currentProduct, setCurrentProduct] = useState("");
  const [currentPrice, setCurrentPrice] = useState<number | "">("");
  const [currentQuantity, setCurrentQuantity] = useState<number>(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      if (editIds && editIds.length > 0) {
        Promise.all(editIds.map(id => axiosInstance.get(`/sales/${id}/`)))
          .then((responses) => {
            const fetchedSales = responses.map(res => res.data);
            setCustomer(fetchedSales[0].customer.toString());
            setPaymentStatus(fetchedSales[0].payment_status);
            setOriginalDate(fetchedSales[0].data_hour);
            setItems(fetchedSales.map(sale => ({
              id: sale.id,
              product: sale.product,
              productName: sale.product_name,
              price: sale.price,
              quantity: sale.quantity,
            })));
            setDeletedItems([]);
          })
          .catch(console.error);
      } else {
        setCustomer("");
        setPaymentStatus("PENDENTE");
        setOriginalDate(null);
        setItems([]);
        setDeletedItems([]);
        setCurrentProduct("");
        setCurrentPrice("");
        setCurrentQuantity(1);
      }
    }
  }, [isOpen, editIds]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleAddItem = () => {
    if (!currentProduct || currentPrice === "" || currentQuantity < 1) return;
    const prodLabel = products.find((p) => p.value === currentProduct)?.label || currentProduct;
    setItems([
      ...items,
      {
        product: currentProduct,
        productName: prodLabel,
        price: Number(currentPrice),
        quantity: currentQuantity,
      },
    ]);
    setCurrentProduct("");
    setCurrentPrice("");
    setCurrentQuantity(1);
  };

  const handleRemoveItem = (index: number) => {
    const itemToRemove = items[index];
    if (itemToRemove.id) {
      setDeletedItems([...deletedItems, itemToRemove.id]);
    }
    setItems(items.filter((_, i) => i !== index));
  };

  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer || items.length === 0) return;
    setLoading(true);
    try {
      if (!editIds || editIds.length === 0) {
        await axiosInstance.post("/checkout/", {
          customer: Number(customer),
          payment_status: paymentStatus,
          items: items.map((i) => ({
            product: i.product,
            quantity: i.quantity,
            price: i.price,
          })),
        });
      } else {
        for (const item of items) {
          const payload: any = {
            customer: Number(customer),
            payment_status: paymentStatus,
            product: item.product,
            quantity: item.quantity,
            price: item.price,
          };
          if (originalDate) {
            payload.data_hour = originalDate;
          }
          if (item.id) {
            await axiosInstance.put(`/sales/${item.id}/`, payload);
          } else {
            await axiosInstance.post("/sales/", payload);
          }
        }
        for (const dId of deletedItems) {
          await axiosInstance.delete(`/sales/${dId}/`);
        }
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div className={styles.form} style={{ maxWidth: "800px", maxHeight: "90vh", overflowY: "auto" }}>
        <button type="button" className={styles.closeButton} onClick={onClose}>
          &times;
        </button>
        <form onSubmit={handleSubmit}>
          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>{editIds && editIds.length > 0 ? "Visualizar / Editar Pedido" : "Novo Pedido"}</legend>

            <div className={styles.row}>
              <div className={styles.inputGroup} style={{ flex: 1 }}>
                <label className={styles.label}>Cliente*</label>
                <select
                  className={styles.select}
                  value={customer}
                  onChange={(e) => setCustomer(e.target.value)}
                  required
                >
                  <option value="" disabled>Selecione o cliente</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className={styles.inputGroup} style={{ flex: 1 }}>
                <label className={styles.label}>Status do Pagamento*</label>
                <select
                  className={styles.select}
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  required
                >
                  <option value="PENDENTE">Pendente</option>
                  <option value="PAGO">Pago</option>
                </select>
              </div>
            </div>

            <div className={styles.cartContainer}>
              <div className={styles.row}>
                <div className={styles.inputGroup} style={{ flex: 2 }}>
                  <label className={styles.label}>Produto</label>
                  <select
                    className={styles.select}
                    value={currentProduct}
                    onChange={(e) => setCurrentProduct(e.target.value)}
                  >
                    <option value="" disabled>Selecione o produto</option>
                    {products.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.inputGroup} style={{ flex: 1 }}>
                  <label className={styles.label}>Preço Unit. (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    className={styles.input}
                    value={currentPrice}
                    onChange={(e) => setCurrentPrice(e.target.value === "" ? "" : Number(e.target.value))}
                  />
                </div>
                <div className={styles.inputGroup} style={{ flex: 1 }}>
                  <label className={styles.label}>Qtd</label>
                  <input
                    type="number"
                    min="1"
                    className={styles.input}
                    value={currentQuantity}
                    onChange={(e) => setCurrentQuantity(Number(e.target.value))}
                  />
                </div>
                <button
                  type="button"
                  className={styles.addItemButton}
                  onClick={handleAddItem}
                  disabled={!currentProduct || currentPrice === ""}
                >
                  <FaPlus />
                </button>
              </div>

              {items.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "1rem" }}>
                  {items.map((item, index) => (
                    <div key={index} className={styles.cartItem}>
                      <div className={styles.cartItemInfo}>
                        <span className={styles.cartItemName}>{item.productName}</span>
                        <span className={styles.cartItemDetails}>
                          {item.quantity}x de R$ {Number(item.price).toFixed(2)} = R$ {(item.quantity * item.price).toFixed(2)}
                        </span>
                      </div>
                      <button
                        type="button"
                        className={styles.removeButton}
                        onClick={() => handleRemoveItem(index)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                  <div className={styles.cartTotal}>
                    Total do Pedido: R$ {total.toFixed(2)}
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              className={styles.button}
              disabled={loading || items.length === 0 || !customer}
            >
              {loading ? "Processando..." : (editIds && editIds.length > 0 ? "Atualizar Pedido" : "Finalizar Pedido")}
            </button>
          </fieldset>
        </form>
      </div>
    </div>
  );
};

export default CheckoutModal;