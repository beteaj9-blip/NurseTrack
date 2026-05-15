import { ExtensionDaysDetailContent } from "@/components/features/ExtensionDaysDetailContent";

export default function Page(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  return <ExtensionDaysDetailContent basePath="/coordinator" searchParams={props.searchParams} />;
}
