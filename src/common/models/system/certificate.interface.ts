export interface Certificate {
  id: string;
  issuedTo: string;
  issuedBy: string;
  issueDate: string;
  expireDate: string;
  thumbprint: string;
}
