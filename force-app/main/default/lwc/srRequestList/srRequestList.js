import { LightningElement, track, wire } from 'lwc';
import getRequests from '@salesforce/apex/SrRequestListController.getRequests';
import { publish, MessageContext } from 'lightning/messageService';
import SR_CHANNEL from '@salesforce/messageChannel/srRequestSelectedChannel__c';
import { subscribe } from "lightning/empApi";
import { refreshApex } from '@salesforce/apex';

export default class SrRequestList extends LightningElement {
    @track requests = [];

    pageSize = 5;
    pageNumber = 1;
    totalRecords = 0;
    totalPages = 0;

    // 🔍 Filters
    searchKey = '';
    statusFilter = '';
    priorityFilter = '';

    // 🔢 Sorting
    sortBy = 'CreatedDate';
    sortDirection = 'DESC';

    searchTimeout;

    subscription = {};

    @wire(MessageContext)
    messageContext;

    connectedCallback() {
        this.loadData();
        this.subscribeToEvent();
    }

    loadData() {
        getRequests({
            pageSize: this.pageSize,
            pageNumber: this.pageNumber,
            sortBy: this.sortBy,
            sortDirection: this.sortDirection,
            searchKey: this.searchKey,
            statusFilter: this.statusFilter,
            priorityFilter: this.priorityFilter
        }).then(result => {
            this.requests = result.records;
            this.totalRecords = result.totalCount;
            this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
        });
    }

    subscribeToEvent() {
        const channel = '/event/Request_Update__e';

        subscribe(channel, -1, (event) => {
            console.log('Event received: ', event);

            // refresh UI or call refreshApex
        }).then(response => {
            this.subscription = response;
            refreshApex(this.loadData());
        });
    }

    // 🔍 Search with debounce
    handleSearch(event) {
        clearTimeout(this.searchTimeout);

        this.searchKey = event.target.value;

        this.searchTimeout = setTimeout(() => {
            this.pageNumber = 1;
            this.loadData();
        }, 400);
    }

    // 🎯 Filters
    handleStatusChange(event) {
        this.statusFilter = event.detail.value;
        this.pageNumber = 1;
        this.loadData();
    }

    handlePriorityChange(event) {
        this.priorityFilter = event.detail.value;
        this.pageNumber = 1;
        this.loadData();
    }

    // 🔢 Sorting
    handleSort(event) {
        const field = event.target.dataset.field;

        if (this.sortBy === field) {
            this.sortDirection = this.sortDirection === 'ASC' ? 'DESC' : 'ASC';
        } else {
            this.sortBy = field;
            this.sortDirection = 'ASC';
        }

        this.loadData();
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

    get statusOptions() {
        return [
            { label: 'All', value: '' },
            { label: 'New', value: 'New' },
            { label: 'Pending Approval', value: 'Pending Approval' },
            { label: 'Approved', value: 'Approved' },
            { label: 'Closed', value: 'Closed' }
    ]   ;
    }

    get priorityOptions() {
        return [
            { label: 'All', value: '' },
            { label: 'Low', value: 'Low' },
            { label: 'Medium', value: 'Medium' },
            { label: 'High', value: 'High' }
        ];
    }
}