import { LightningElement, track, wire } from 'lwc';
import { subscribe, MessageContext } from 'lightning/messageService';
import SR_CHANNEL from '@salesforce/messageChannel/srRequestSelectedChannel__c';
import getComments from '@salesforce/apex/SrRequestListController.getComments';

export default class SrRequestComments extends LightningElement {
    @track comments = [];
    recordId;

    @wire(MessageContext)
    messageContext;

    connectedCallback() {
        subscribe(this.messageContext, SR_CHANNEL, (message) => {
            this.recordId = message.requestId;
            this.loadComments();
        });
    }

    loadComments() {
        if (!this.recordId) return;

        getComments({ requestId: this.recordId })
            .then(result => {
                this.comments = result;
            });
    }
}