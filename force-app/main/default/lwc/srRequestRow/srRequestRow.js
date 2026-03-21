import { LightningElement, api } from 'lwc';

export default class SrRequestRow extends LightningElement {
    @api request;

    handleClick() {
        this.dispatchEvent(
            new CustomEvent('requestselect', {
                detail: this.request.Id
            })
        );
    }
}