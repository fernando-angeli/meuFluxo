import { redirect } from "next/navigation";

export default function CardsExpensesPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const query = new URLSearchParams();
  Object.entries(searchParams ?? {}).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => query.append(key, v));
      return;
    }
    if (value != null) query.set(key, value);
  });

  const suffix = query.toString();
  redirect(suffix ? `/card-expenses?${suffix}` : "/card-expenses");
}
