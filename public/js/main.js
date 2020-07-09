$(function(){
    if($('textarea#ta').length){
        CKEDITOR.replace('ta');
    }

    $('a.DeleteConfirmation').on('click', function(){

        if(!confirm('Confirm Deletion')){
            return false;  
        }
    });

    $('[data-fancybox="gallery"]').fancybox({
        // Options will go here
    });
});