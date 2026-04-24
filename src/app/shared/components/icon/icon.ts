import { Component, input } from '@angular/core';

export type IconName =
  | 'home' | 'catalog' | 'borrow' | 'settings' | 'logout'
  | 'search' | 'bell' | 'profile' | 'heart' | 'history'
  | 'bookmark' | 'clock' | 'star' | 'plus' | 'users'
  | 'book' | 'chevron-right' | 'arrow-right' | 'check';

@Component({
  selector: 'app-icon',
  templateUrl: './icon.html',
  host: { '[style.display]': '"contents"' },
})
export class IconComponent {
  name = input.required<IconName>();
  size = input<number>(18);
  strokeWidth = input<number>(1.6);
}
