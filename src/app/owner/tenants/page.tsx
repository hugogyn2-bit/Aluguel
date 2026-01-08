import TenantsCreateForm from "./tenants-create-form";
import TenantsList from "./tenants-list";

export default function Page() {
  return (
    <main className="mx-auto max-w-3xl p-6 grid gap-6">
      <header>
        <h1 className="text-2xl font-bold">Inquilinos</h1>
        <p className="text-sm text-gray-600 mt-1">
          Crie acessos de inquilino e gerencie os dados básicos.
        </p>
      </header>

      <TenantsCreateForm />
      <TenantsList />
    </main>
  );
}
