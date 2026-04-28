import { Component } from "@angular/core";
import { IconComponent } from '../../../shared/components/icon/icon';

@Component({
    selector: 'app-reserve-button',
    standalone: true,
    imports: [IconComponent],
    templateUrl: './reserve-button.html',
    styleUrl: './reserve-button.css',
})
export class ReserveButton {}