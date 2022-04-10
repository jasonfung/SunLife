import { LightningElement, wire } from 'lwc';
import findAccounts from '@salesforce/apex/sunlifeAccountController.findAccounts';

const columns = [
    { label: 'Account Name', fieldName: 'AccountURL', type: 'url', typeAttributes: {label: {fieldName: 'Name'}, target: '_blank'}, sortable: true },
    { label: 'Account Owner', fieldName: 'OwnerName', sortable: true },
    { label: 'Phone', fieldName: 'Phone', type: 'phone' },
    { label: 'Website', fieldName: 'Website', type: 'url' },
    { label: 'Annual Revenue', fieldName: 'AnnualRevenue', type: 'currency' }
];

/** The delay used when debouncing event handlers before invoking Apex. */
const DELAY = 300;

export default class accountDataTableJason extends LightningElement {
    searchKey = '';
    columns = columns;
    accounts;
    error;
    defaultSortDirection = 'asc';
    sortDirection = 'asc';
    sortedBy;

    @wire(findAccounts, { searchKey: '$searchKey' })
    wiredAccounts({data, error}){
		if(data) {
			this.accounts = data.map(row=>{
                return{...row, OwnerName: row.Owner.Name, Name: row.Name, AccountURL: '/' + row.Id}
            })
			this.error = undefined;
		}else {
			this.accounts =undefined;
			this.error = error;
		}
	}

    handleKeyChange(event) {
        // Debouncing this method: Do not update the reactive property as long as this function is
        // being called within a delay of DELAY. This is to avoid a very large number of Apex method calls.
        window.clearTimeout(this.delayTimeout);
        const searchKey = event.target.value;
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.delayTimeout = setTimeout(() => {
            this.searchKey = searchKey;
        }, DELAY);
    }

    // Used to sort the 'Age' column
    sortBy(field, reverse, primer) {
        const key = primer
            ? function(x) {
                return primer(x[field]);
            }
            : function(x) {
                return x[field];
            };

        return function(a, b) {
            a = key(a);
            b = key(b);
            return reverse * ((a > b) - (b > a));
        };
    }

    onHandleSort(event) {
        const { fieldName: sortedBy, sortDirection } = event.detail;
        const cloneData = [...this.data];

        cloneData.sort(this.sortBy(sortedBy, sortDirection === 'asc' ? 1 : -1));
        this.data = cloneData;
        this.sortDirection = sortDirection;
        this.sortedBy = sortedBy;
    }
}