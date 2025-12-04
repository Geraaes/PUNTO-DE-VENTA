type AutoTableOptions = Record<string, unknown>;

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: AutoTableOptions) => jsPDF;
    lastAutoTable: {
      finalY: number;
    };
  }
}
