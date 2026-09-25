import { useEffect, useState } from "react";
import Modal from "../../components/ui/Modal";
import { Field, Input, Select, Textarea } from "../../components/ui/FormField";
import Button from "../../components/ui/Button";
import * as dropdownsApi from "../../api/dropdowns";
import * as productsApi from "../../api/products";
import { formatEnumLabel } from "../../utils/format";

const emptyForm = { productName: "", description: "", category: "", condition: "", price: "", stockQuantity: "" };

const ProductFormModal = ({ initialData, onClose, onSaved }) => {
  const [form, setForm] = useState(
    initialData
      ? {
          productName: initialData.productName || "",
          description: initialData.description || "",
          category: initialData.category || "",
          condition: initialData.condition || "",
          price: initialData.currentPrice ?? "",
          stockQuantity: initialData.stockQuantity ?? "",
        }
      : emptyForm,
  );
  const [categories, setCategories] = useState([]);
  const [conditions, setConditions] = useState([]);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    dropdownsApi.getDropdown("product-categories").then((data) => {
      setCategories(data || []);
      setForm((f) => ({ ...f, category: f.category || data?.[0] || "" }));
    });
    dropdownsApi.getDropdown("product-conditions").then((data) => {
      setConditions(data || []);
      setForm((f) => ({ ...f, condition: f.condition || data?.[0] || "" }));
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = { ...form, price: Number(form.price), stockQuantity: Number(form.stockQuantity) };
      const product = initialData ? await productsApi.updateProduct(initialData.id, payload) : await productsApi.addProduct(payload);
      if (image) await productsApi.uploadProductImage(product.id, image);
      onSaved?.();
    } catch (err) {
      setError(err?.response?.data?.message || "Could not save this product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open onClose={onClose} title={initialData ? "Edit product" : "Add product"} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="rounded-md border border-danger/20 bg-danger-subtle px-3.5 py-2.5 text-[13px] text-danger">{error}</p>}

        <Field label="Product name" htmlFor="productName">
          <Input id="productName" required minLength={3} maxLength={255} value={form.productName} onChange={(e) => setForm((f) => ({ ...f, productName: e.target.value }))} />
        </Field>

        <Field label="Description" htmlFor="description">
          <Textarea id="description" maxLength={2000} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Category" htmlFor="category">
            <Select id="category" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {formatEnumLabel(c)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Condition" htmlFor="condition">
            <Select id="condition" value={form.condition} onChange={(e) => setForm((f) => ({ ...f, condition: e.target.value }))}>
              {conditions.map((c) => (
                <option key={c} value={c}>
                  {formatEnumLabel(c)}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Price" htmlFor="price">
            <Input id="price" type="number" min="0.01" step="0.01" required value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} />
          </Field>
          <Field label="Stock quantity" htmlFor="stockQuantity">
            <Input id="stockQuantity" type="number" min="0" step="1" required value={form.stockQuantity} onChange={(e) => setForm((f) => ({ ...f, stockQuantity: e.target.value }))} />
          </Field>
        </div>

        <Field label="Image (optional)" htmlFor="image">
          <input id="image" type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} className="text-[13px] text-ink-secondary" />
        </Field>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {initialData ? "Save changes" : "Add product"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ProductFormModal;
