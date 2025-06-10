import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DigitalSignature } from 'src/app/models/digital-signature.model';
import { DigitalSignatureService } from 'src/app/services/digital-signature-service.service';

@Component({
  selector: 'app-signature-form',
  templateUrl: './signature-form.component.html',
  styleUrls: ['./signature-form.component.scss'],
})
export class SignatureFormComponent implements OnInit {
  isUpdate = false;
  userId!: number;
  signatureId?: number;
  file?: File;
  previewUrl?: string;

  constructor(private route: ActivatedRoute, protected router: Router, private signatureSvc: DigitalSignatureService) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.isUpdate = true;
        this.signatureId = +params['id'];
        this.signatureSvc.getById(this.signatureId!).subscribe((sig) => (this.previewUrl = sig.photo));
      } else if (params['userId']) {
        this.userId = +params['userId'];
      }
    });
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => (this.previewUrl = reader.result as string);
      reader.readAsDataURL(this.file);
    }
  }

  submit(): void {
    if (!this.file && !this.isUpdate) return;
    const obs = this.isUpdate ? this.signatureSvc.update(this.signatureId!, this.file!) : this.signatureSvc.create(this.userId, this.file!);
    obs.subscribe(() => this.router.navigate(['/signatures']));
  }
}
