import { LightningElement, wire } from 'lwc';
import { subscribe, MessageContext } from 'lightning/messageService';
import SR_CHANNEL from '@salesforce/messageChannel/srRequestSelectedChannel__c';
import { getRecord } from 'lightning/uiRecordApi';

const FIELDS = [
    'Service_Request__c.Subject__c',
    'Service_Request__c.Status__c',
    'Service_Request__c.Priority__c',
    'Service_Request__c.Description__c',
    'Service_Request__c.SLA_Due_Date__c'
];

export default class SrRequestDetails extends LightningElement {
    recordId;
    record;

    @wire(MessageContext)
    messageContext;

    subscription;

    connectedCallback() {
        this.subscription = subscribe(
            this.messageContext,
            SR_CHANNEL,
            (message) => {
                this.recordId = message.requestId;
            }
        );
    }

    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    wiredRecord({ data }) {
        if (data) {
            this.record = data;
        }
    }
}