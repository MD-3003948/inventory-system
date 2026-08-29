import { useEffect, useState } from "react";
import { lookupsApi, ApiError } from "../api";
import { AttributeTemplateForm } from "./AttributeTemplateForm";
import type { AttributeTemplate, AttributeTemplateInput } from "../types";

export function AttributeTemplatesPage() {
  const [templates, setTemplates] = useState<AttributeTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<AttributeTemplate | null>(null);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      setTemplates(await lookupsApi.attributeTemplates());
      setError(null);
    } catch {
      setError("Could not reach the API. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleSubmit = async (input: AttributeTemplateInput) => {
    setError(null);
    try {
      if (editingTemplate) {
        await lookupsApi.updateAttributeTemplate(editingTemplate.id, input);
        setEditingTemplate(null);
      } else {
        await lookupsApi.createAttributeTemplate(input);
      }
      await loadTemplates();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save the attribute template.");
    }
  };

  const handleDelete = async (id: number) => {
    setError(null);
    try {
      await lookupsApi.removeAttributeTemplate(id);
      await loadTemplates();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not delete the attribute template.");
    }
  };

  return (
    <div className="mx-auto w-[95%] py-10">
      <h1 className="text-2xl font-semibold">Attribute Templates</h1>
      <p className="mt-1 text-sm text-term-green/60">Manage the reusable attribute templates products can be assigned.</p>

      <div className="mt-6">
        <AttributeTemplateForm
          editingTemplate={editingTemplate}
          onSubmit={handleSubmit}
          onCancelEdit={() => setEditingTemplate(null)}
        />
      </div>

      {error && <p className="mt-4 text-sm text-term-danger">{error}</p>}
      {loading ? (
        <p className="mt-6 text-sm text-term-green/60">Loading...</p>
      ) : templates.length === 0 ? (
        <p className="mt-6 text-sm text-term-green/60">No attribute templates yet. Add one above.</p>
      ) : (
        <table className="mt-6 w-full border-collapse border-2 border-term-amber text-left text-sm">
          <thead className="bg-term-panel text-term-amber">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {templates.map((t) => (
              <tr key={t.id} className="border-t border-term-amber/30">
                <td className="px-4 py-2 font-medium">{t.name}</td>
                <td className="px-4 py-2 text-right">
                  <button onClick={() => setEditingTemplate(t)} className="mr-3 text-term-amber hover:underline">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(t.id)} className="text-term-danger hover:underline">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
