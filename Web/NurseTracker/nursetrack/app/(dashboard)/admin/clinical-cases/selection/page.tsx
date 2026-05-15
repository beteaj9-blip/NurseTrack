import { ClinicalCasesSelectionContent } from "@/components/features/ClinicalCasesSelectionContent";

export default function Page(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  return <ClinicalCasesSelectionContent basePath="/admin" searchParams={props.searchParams} />;
}
