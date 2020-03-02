export interface Certificate {
    id: number;
    issuedTo: string;
    issuedBy: string;
    issueDate: string;
    expireDate: string;
    thumbprint: string;
}
