import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { productsApi, lookupsApi, customersApi, departmentsApi } from "../api";
import { FormField } from "./FormField";
import type {
  PartCategory,
  PartSubCategory,
  CustomerCategory,
  AttributeTemplate,
  Customer,
  Department,
} from "../types";

export function CreateProductPage() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState<PartCategory[]>([]);
  const [subCategories, setSubCategories] = useState<PartSubCategory[]>([]);
  const [customerCategories, setCustomerCategories] = useState<CustomerCategory[]>([]);
  const [templates, setTemplates] = useState<AttributeTemplate[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [partCategoryId, setPartCategoryId] = useState<number | "">("");
  const [partSubCategoryId, setPartSubCategoryId] = useState<number | "">("");
  const [attributeTemplateId, setAttributeTemplateId] = useState<number | "">("");
  const [customerCategoryId, setCustomerCategoryId] = useState<number | "">("");
  const [assignedCustomerId, setAssignedCustomerId] = useState<number | "">("");
  const [departmentId, setDepartmentId] = useState<number | "">("");
  const [unitPrice, setUnitPrice] = useState(0);

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    lookupsApi.partCategories().then(setCategories).catch(() => {});
    lookupsApi.customerCategories().then(setCustomerCategories).catch(() => {});
    lookupsApi.attributeTemplates().then(setTemplates).catch(() => {});
    customersApi.list().then(setCustomers).catch(() => {});
    departmentsApi.list().then(setDepartments).catch(() => {});
  }, []);

  useEffect(() => {
    lookupsApi
      .partSubCategories(partCategoryId || undefined)
      .then(setSubCategories)
      .catch(() => {});
    setPartSubCategoryId("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partCategoryId]);

  const applyImage = (file: File | null) => {
    setImage(file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) applyImage(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!partCategoryId || !partSubCategoryId || !customerCategoryId) {
      setError("Part category, sub-category, and customer category are required.");
      return;
    }

    setSubmitting(true);
    try {
      const product = await productsApi.create({
        sku,
        name,
        description,
        partCategoryId,
        partSubCategoryId,
        attributeTemplateId: attributeTemplateId || null,
        customerCategoryId,
        assignedCustomerId: assignedCustomerId || null,
        departmentId: departmentId || null,
        unitPrice,
        image,
      });
      navigate(`/products/${product.id}`);
    } catch {
      setError("Could not create the product. Check the SKU isn't already in use.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-[95%] py-10">
      <h1 className="text-2xl font-semibold">Create Product</h1>
      <p className="mt-1 text-sm text-term-green/60">Add a new part to the catalog.</p>

      <form onSubmit={handleSubmit} className="terminal-panel mt-6 grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
        <FormField label="SKU">
          <input
            required
            placeholder="SKU"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            className="terminal-input"
          />
        </FormField>
        <FormField label="Product Name">
          <input
            required
            placeholder="Product Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="terminal-input"
          />
        </FormField>

        <FormField label="Description" className="sm:col-span-2">
          <textarea
            placeholder="Product Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="terminal-input"
          />
        </FormField>

        <FormField label="Part Category">
          <select
            required
            value={partCategoryId}
            onChange={(e) => setPartCategoryId(e.target.value ? Number(e.target.value) : "")}
            className="terminal-input"
          >
            <option value="">Part Category...</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id} className="bg-term-bg text-term-green">
                {c.name}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Part Sub-Category">
          <select
            required
            value={partSubCategoryId}
            onChange={(e) => setPartSubCategoryId(e.target.value ? Number(e.target.value) : "")}
            className="terminal-input"
            disabled={!partCategoryId}
          >
            <option value="">Part Sub-Category...</option>
            {subCategories.map((c) => (
              <option key={c.id} value={c.id} className="bg-term-bg text-term-green">
                {c.name}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Attribute Template (optional)">
          <select
            value={attributeTemplateId}
            onChange={(e) => setAttributeTemplateId(e.target.value ? Number(e.target.value) : "")}
            className="terminal-input"
          >
            <option value="">Attribute Template (optional)...</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id} className="bg-term-bg text-term-green">
                {t.name}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Customer Category">
          <select
            required
            value={customerCategoryId}
            onChange={(e) => setCustomerCategoryId(e.target.value ? Number(e.target.value) : "")}
            className="terminal-input"
          >
            <option value="">Customer Category...</option>
            {customerCategories.map((c) => (
              <option key={c.id} value={c.id} className="bg-term-bg text-term-green">
                {c.name}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Assigned Customer (optional)">
          <select
            value={assignedCustomerId}
            onChange={(e) => setAssignedCustomerId(e.target.value ? Number(e.target.value) : "")}
            className="terminal-input"
          >
            <option value="">Assigned Customer (optional)...</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id} className="bg-term-bg text-term-green">
                {c.name}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Department (optional)">
          <select
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value ? Number(e.target.value) : "")}
            className="terminal-input"
          >
            <option value="">Department (optional)...</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id} className="bg-term-bg text-term-green">
                {d.name}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Cost per Unit">
          <input
            required
            type="number"
            min={0}
            step="0.01"
            placeholder="Cost per unit"
            value={unitPrice}
            onChange={(e) => setUnitPrice(Number(e.target.value))}
            className="terminal-input"
          />
        </FormField>

        <FormField label="Part Image or Drawing (optional)" className="sm:col-span-2">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed p-6 text-center text-sm normal-case tracking-normal text-term-green ${
              dragging ? "border-term-green bg-term-panel" : "border-term-amber/60"
            }`}
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Part preview" className="max-h-40 object-contain" />
            ) : (
              <p className="text-term-green/60">Drag and drop a part drawing or image here, or</p>
            )}
            <label className="terminal-button-secondary cursor-pointer">
              {image ? image.name : "Browse files"}
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.gif,.webp,.pdf"
                className="hidden"
                onChange={(e) => applyImage(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>
        </FormField>

        {error && <p className="text-sm text-term-danger sm:col-span-2">{error}</p>}

        <div className="flex gap-2 sm:col-span-2">
          <button type="submit" disabled={submitting} className="terminal-button">
            {submitting ? "Creating..." : "Create Product"}
          </button>
          <button type="button" onClick={() => navigate("/products")} className="terminal-button-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
