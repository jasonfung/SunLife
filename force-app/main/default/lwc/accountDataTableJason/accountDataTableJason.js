import { LightningElement } from 'lwc';
import findAccounts from '@salesforce/apex/sunlifeAccountController.findAccounts';
import { NavigationMixin } from 'lightning/navigation';

const actions = [
    { label: 'View', name: 'view' },
    { label: 'Edit', name: 'edit' },
];
 
const columns = [   
    { label: 'Account Name', fieldName: 'AccountURL', sortBy: 'Name', type: 'url', typeAttributes: {label: {fieldName: 'Name'}, target: '_blank'}, sortable: true },
    { label: 'Account Owner', fieldName: 'OwnerName', sortBy: 'OwnerName', sortable: true },
    { label: 'Phone', fieldName: 'Phone', type: 'phone' },
    { label: 'Website', fieldName: 'Website', type: 'url' },
    { label: 'Annual Revenue', fieldName: 'AnnualRevenue', type: 'currency' },
    {
        type: 'action',
        typeAttributes: { rowActions: actions },
    },
];

export default class accountDataTableJason extends NavigationMixin( LightningElement ) {
    accounts;
    error;
    columns = columns;
    sortedBy;
    defaultSortDirection = 'asc';
    sortDirection = 'asc';
    
    connectedCallback(){
        const searchKey = '';
        findAccounts( { searchKey } )   
            .then(result => {
                this.accounts = result.map(row=>{
                    return{...row, OwnerName: row.Owner.Name, Name: row.Name, AccountURL: '/' + row.Id}
                }) 
            })
            .catch(error => {
 
                this.error = error;
 
            });
    } 

    handleKeyChange(event) {
         
        const searchKey = event.target.value;
        
        findAccounts( { searchKey } )   
            .then(result => {
                this.accounts = result.map(row=>{
                    return{...row, OwnerName: row.Owner.Name, Name: row.Name, AccountURL: '/' + row.Id}
                }) 
            })
            .catch(error => {
 
                this.error = error;
 
            }); 
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

}