import {Component, ViewContainerRef} from '@angular/core';

import './rxjs-operators';


@Component({
    selector: 'ndb-app',
    template: '<ndb-ui></ndb-ui>'
})
export class AppComponent {

    public constructor(viewContainerRef: ViewContainerRef) {
        // You need this small hack in order to catch application root view container ref
        this.viewContainerRef = viewContainerRef;
    }
}
