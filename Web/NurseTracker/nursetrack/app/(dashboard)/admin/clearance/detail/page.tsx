import { ClearanceDetailContent } from "@/components/features/ClearanceDetailContent";

export default function Page(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  return <ClearanceDetailContent basePath="/admin" searchParams={props.searchParams} />;
}
