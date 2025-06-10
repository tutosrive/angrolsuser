import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/models/user.model';
import { DigitalSignatureService } from 'src/app/services/digital-signature-service.service';
import { DigitalSignature } from 'src/app/models/digital-signature.model';

@Component({
  selector: 'app-signature',
  templateUrl: './signature.component.html',
  styleUrls: ['./signature.component.scss']
})
export class SignatureComponent implements OnInit {
  signature: DigitalSignature | null = null;
  user: User | null = null;

  constructor(
    private route: ActivatedRoute,
    private signatureSvc: DigitalSignatureService,
    private userSvc: UserService
  ) {}

  ngOnInit(): void {
    const userId = Number(this.route.snapshot.paramMap.get('id'));
    // Cargar firma digital
    this.signatureSvc.getByUserId(userId)
      .subscribe({
        next: sig => this.signature = sig,
        error: err => console.error('Error cargando firma', err)
      });
    // Cargar datos del usuario
    this.userSvc.getUserById(userId)
      .subscribe({
        next: usr => this.user = usr,
        error: err => console.error('Error cargando usuario', err)
      });
  }
}