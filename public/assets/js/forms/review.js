var ReviewForm = function () {

    return {
        
        //Review Form
        initReviewForm: function () {
	        // Validation
	        $("#sky-form2").validate({
	            // Rules for form validation
	            rules:
	            {
	                overall:
	                {
	                    required: true
	                }
	                //name:
	                //{
	                //    required: true
	                //},
	                //email:
	                //{
	                //    required: true,
	                //    email: true
	                //},
	                //review:
	                //{
	                //    required: true,
	                //    minlength: 20
	                //},
	                //quality:
	                //{
	                //    required: true
	                //},
	                //reliability:
	                //{
	                //    required: true
	                //},
	            },
	                                
	            // Messages for form validation
	            messages:
	            {
	                overall:
	                {
	                    required: 'Your overall rate would be greatly appreciated'
	                }
	                //name:
	                //{
	                //    required: 'Please enter your name'
	                //},
	                //email:
	                //{
	                //    required: 'Please enter your email address',
	                //    email: 'Please enter a VALID email address'
	                //},
	                //review:
	                //{
	                //    required: 'A comment from you would be greatly appreciated'
	                //},
	                //quality:
	                //{
	                //    required: 'Please rate quality of the product'
	                //},
	                //reliability:
	                //{
	                //    required: 'Please rate reliability of the product'
	                //},
	            },                  
	            
	            // Do not change code below
	            errorPlacement: function(error, element)
	            {
	                error.insertAfter(element.parent());
	            }
	        });
        }

    };

}();
