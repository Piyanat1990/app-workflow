import { JsonPipe, Location } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { Observable } from 'rxjs';
import { CanComponentDeactivate } from '../../../auth/guards/can-deactivate.guard';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { ItemService } from '../../item.service';
import { ItemStatus } from '../../models/item';

@Component({
  selector: 'app-item-form',
  standalone: true,
  imports: [ReactiveFormsModule, JsonPipe],
  templateUrl: './item-form.component.html',
  styleUrl: './item-form.component.scss'
})
export class ItemFormComponent implements OnInit, CanComponentDeactivate {
  @Input()
  id: number | null = null;

  // injects
  location = inject(Location);
  fb = inject(NonNullableFormBuilder);
  itemService = inject(ItemService);

  title = this.fb.control<string>('', { validators: Validators.required });
  amount = this.fb.control<number>(null!, {
    validators: [Validators.required, Validators.min(1)]
  });
  quantity = this.fb.control<number>(null!, {
    validators: [Validators.required, Validators.min(0.5)]
  });

  fg = this.fb.group({
    title: this.title,
    amount: this.amount,
    quantity: this.quantity
  });

  modalService = inject(BsModalService);
  bsModalRef?: BsModalRef;

  ngOnInit() {
    if (this.id) {
      this.itemService.get(this.id).subscribe((v) => this.fg.patchValue(v));
    }
  }

  onBack(): void {
    this.location.back();
  }

  onSubmit(): void {
    const item = { ...this.fg.getRawValue(), status: ItemStatus.PENDING };
    console.log(item);
    if (this.id) {
      this.itemService.edit(this.id, item).subscribe(() => this.onBack());
    } else {
      this.itemService.add(item).subscribe(() => this.onBack());
    }
  }

  canDeactivate(): boolean | Observable<boolean
  > {
    // check is dirty-form
    const isFormDirty = this.fg.dirty;
    if (!isFormDirty) {
      return true;
    }

    // init comfirm modal
    const initialState: ModalOptions = {
      initialState: {
        title: `Confirm to leave" ?`
      }
    };
    this.bsModalRef = this.modalService.show(ConfirmModalComponent, initialState);

    return new Observable<boolean>((observer) => {
      this.bsModalRef?.onHidden?.subscribe(() => {
        observer.next(this.bsModalRef?.content?.confirmed);
        observer.complete();
      });
    });
  }
}
