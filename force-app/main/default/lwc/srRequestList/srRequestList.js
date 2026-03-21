import { LightningElement, track, wire } from 'lwc';
import getRequests from '@salesforce/apex/SrRequestListController.getRequests';
import { publish, MessageContext } from 'lightning/messageService';
import SR_CHANNEL from '@salesforce/messageChannel/srRequestSelectedChannel__c';

export default class SrRequestList extends LightningElement {
    @track requests = [];

    pageSize = 5;
    pageNumber = 1;
    totalRecords = 0;
    totalPages = 0;

    @wire(MessageContext)
    messageContext;

    connectedCallback() {
        this.loadData();
    }

    loadData() {
        getRequests({
            pageSize: this.pageSize,
            pageNumber: this.pageNumber
        }).then(result => {
            this.requests = result.records;
            this.totalRecords = result.totalCount;
            this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
        });
    }

    handleSelect(event) {
        publish(this.messageContext, SR_CHANNEL, {
            requestId: event.detail
        });
    }

    nextPage() {
        if (this.pageNumber < this.totalPages) {
            this.pageNumber++;
            this.loadData();
        }
    }

    prevPage() {
        if (this.pageNumber > 1) {
            this.pageNumber--;
            this.loadData();
        }
    }

    goToPage(event) {
    this.pageNumber = Number(event.target.dataset.page);
    this.loadData();
    }

    get disablePrev() {
        return this.pageNumber === 1;
    }

    get disableNext() {
        return this.pageNumber === this.totalPages;
    }
    
    // get pages() {
    // return Array.from({ length: this.totalPages }, (_, i) => i + 1);
    // }

    get pages() {
        let pageList = [];
        for (let i = 1; i <= this.totalPages; i++) {
            pageList.push({
                value: i,
                // The button is disabled if it matches the current page
                disabled: i === this.pageNumber,
                // Optional: change color of the active page
                variant: i === this.pageNumber ? 'brand' : 'neutral'
            });
        }
        return pageList;
    }
}