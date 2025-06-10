import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DigitalSignature } from 'src/app/models/digital-signature.model';
import { DigitalSignatureService } from 'src/app/services/digital-signature-service.service';

@Component({
  selector: 'app-signature-list',
  templateUrl: './signature-list.component.html',
  styleUrls: ['./signature-list.component.scss'],
})
export class SignatureListComponent implements OnInit {
  signatures: DigitalSignature[] = [];
  isLoading = false;
  errorMessage?: string;

  constructor(private signatureSvc: DigitalSignatureService, private router: Router) {}

  ngOnInit(): void {
    this.loadSignatures();
  }

  loadSignatures(): void {
    this.isLoading = true;
    this.signatureSvc.getAll().subscribe({
      next: (data) => {
        this.signatures = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.message;
        this.isLoading = false;
      },
    });
  }

  create(): void {
    const userId = Number(prompt('ID de usuario para crear firma'));
    if (userId) this.router.navigate(['signature/create', userId]);
  }

  edit(sig: DigitalSignature): void {
    this.router.navigate(['signature/update', sig.id]);
  }

  delete(sig: DigitalSignature): void {
    if (confirm(`¿Eliminar firma de usuario ${sig.user?.id}?`)) {
      this.signatureSvc.delete(sig.id!).subscribe({ next: () => this.loadSignatures(), error: (e) => (this.errorMessage = e.message) });
    }
  }
}
