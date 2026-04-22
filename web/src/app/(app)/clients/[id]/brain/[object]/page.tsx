import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { getBrainObject } from "@/lib/brain-objects";
import { SingletonForm } from "@/components/brain/singleton-form";
import { CollectionTable } from "@/components/brain/collection-table";
import { FIELD_DEFS } from "@/lib/brain-field-defs";
import Link from "next/link";

export default async function BrainObjectPage({
  params,
}: {
  params: Promise<{ id: string; object: string }>;
}) {
  const { id, object } = await params;
  const meta = getBrainObject(object);
  if (!meta) notFound();

  const supabase = await createClient();
  const fieldDef = FIELD_DEFS[meta.key];
  if (!fieldDef) notFound();

  if (meta.singleton) {
    const { data } = await supabase
      .from(meta.table)
      .select("*")
      .eq("client_id", id)
      .maybeSingle();

    return (
      <div className="p-8 max-w-4xl">
        <Link
          href={`/clients/${id}/brain`}
          className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block"
        >
          &larr; Brain
        </Link>
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          {meta.label}
        </h2>
        <div className="bg-white rounded-lg border p-6">
          <SingletonForm
            clientId={id}
            objectKey={meta.key}
            fields={fieldDef}
            initialData={data}
          />
        </div>
      </div>
    );
  }

  const { data } = await supabase
    .from(meta.table)
    .select("*")
    .eq("client_id", id)
    .order("last_updated", { ascending: false });

  return (
    <div className="p-8">
      <Link
        href={`/clients/${id}/brain`}
        className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block"
      >
        &larr; Brain
      </Link>
      <h2 className="text-lg font-semibold text-gray-900 mb-6">{meta.label}</h2>
      <CollectionTable
        clientId={id}
        objectKey={meta.key}
        fields={fieldDef}
        data={data || []}
      />
    </div>
  );
}
