import { LightningElement, wire } from 'lwc';
import findAccounts from '@salesforce/apex/sunlifeAccountController.findAccounts';
import updateAccounts from '@salesforce/apex/sunlifeAccountController.updateAccounts';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
 
const actions = [
    { label: 'View', name: 'view' },
    { label: 'Edit', name: 'edit' },
];

const columns = [   
    { label: 'Account Name', fieldName: 'AccountURL', sortBy: 'Name', type: 'url', typeAttributes: {label: {fieldName: 'Name'}, target: '_blank'}, sortable: true },
    { label: 'Account Owner', fieldName: 'OwnerName', sortBy: 'OwnerName', sortable: true },
    { label: 'Phone', fieldName: 'Phone', type: 'phone', editable: true },
    { label: 'Website', fieldName: 'Website', type: 'url', editable: true },
    { label: 'Annual Revenue', fieldName: 'AnnualRevenue', type: 'currency', editable: true },
    {
        type: 'action',
        typeAttributes: { rowActions: actions },
    }
];

export default class accountDataTableJason extends NavigationMixin( LightningElement ) {    
    accounts;
    searchString = '';
    error;
    columns = columns;
    sortedBy;
    defaultSortDirection = 'asc';
    sortDirection = 'asc';
    draftValues = [];
    wiredActivities;
    
    @wire(findAccounts, {searchKey: '$searchString'}) 
    wireAccounts(value) {
        this.wiredActivities = value; // track the provisioned value
        const { data, error } = value; // destructure the provisioned value
        if (data) {
            this.accounts = data.map(row=>{
                return{...row, OwnerName: row.Owner.Name, Name: row.Name, AccountURL: '/' + row.Id}
            });
            this.error = undefined;
        }
        else if (error) {
            this.accounts =undefined;
            this.error = 'Unknown error';
            if (Array.isArray(error.body)) {
                this.error = error.body.map(e => e.message).join(', ');
            } else if (typeof error.body.message === 'string') {
                this.error = error.body.message;
            }
        }
    }

    handleKeyChange(event) {
        this.searchString = event.target.value;
    }
    
    onHandleSort( event ) {

        const { fieldName: sortedBy, sortDirection } = event.detail;
        const cloneData = [...this.accounts];
        const sortFieldName = this.columns.find(field=>sortedBy===field.fieldName).sortBy;
        cloneData.sort( this.sortBy( sortFieldName, sortDirection === 'asc' ? 1 : -1 ) );
        this.accounts = cloneData;
        this.sortDirection = sortDirection;
        this.sortedBy = sortedBy;

    }

    sortBy( field, reverse, primer ) {

        const key = primer
            ? function( x ) {
                  return primer(x[field]);
              }
            : function( x ) {
                  return x[field];
              };

        return function( a, b ) {
            a = key(a);
            b = key(b);
            return reverse * ( ( a > b ) - ( b > a ) );
        };

    }

    async handleSave(event) {
        const updatedFields = event.detail.draftValues;

        // Clear all datatable draft values
        this.draftValues = [];

        try {
            // Pass edited fields to the updateAccounts Apex controller
            await updateAccounts({ accountsForUpdate: updatedFields });

            // Report success with a toast
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Accounts updated',
                    variant: 'success'
                })
            );

            // Display fresh data in the datatable
            await refreshApex(this.wiredActivities);
        } catch (error) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error while updating or refreshing records',
                    message: error.body.message,
                    variant: 'error'
                })
            );
        }
    }

    handleRowAction( event ) {

        const actionName = event.detail.action.name;
        const row = event.detail.row;
        switch ( actionName ) {
            case 'view':
                this[NavigationMixin.Navigate]({
                    type: 'standard__recordPage',
                    attributes: {
                        recordId: row.Id,
                        actionName: 'view'
                    }
                }); 
                break;
            case 'edit':
                this[NavigationMixin.Navigate]({
                    type: 'standard__recordPage',
                    attributes: {
                        recordId: row.Id,
                        objectApiName: 'Account',
                        actionName: 'edit'
                    }
                });
                break;
            default:
        }

    }
}