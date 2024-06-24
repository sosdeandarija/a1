window.onload = function () {
    const checkboxes = document.getElementsByName('cbValueGroup')
    let checkedValue;
    let agreeResult = false;
    let outputValue = document.querySelector("#selectedValue")
    let data = {};
    let regexNum = /^06[0-9](\d){6,8}$/
    let regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

    let typingTimer;
    let customInputField = document.querySelector("#enteredCustomValue")
    let dataInputFields = document.querySelectorAll(".inputData input[type=text]")

    let numberInput = document.querySelector("#number")
    let confirmInput = document.querySelector("#confirmNumber")
    let emailInput = document.querySelector("#email")

    let customInputError = document.querySelector(".errorCustomInput")
    let numberError = document.querySelector(".errorNumber")
    let confirmError = document.querySelector(".errorNumberConfirm")
    let emailError = document.querySelector(".errorEmail")
    let agreeError = document.querySelector(".errorAgree")
    let amountError = document.querySelector(".errorAmount")

    let agreementCb = document.querySelector("#agree")

    let cardCbGroup = document.getElementsByName('cardCbGroup');
    let cardCb;

    cardCbGroup.forEach(cb => {
        if(cb.checked) cardCb = cb.value

        cb.addEventListener('change', () => {
            cardCbGroup.forEach(c => {
                if(cb !== c) c.checked = false;
            })

            const anyChecked = Array.from(cardCbGroup).some(cb => cb.checked);
                if (!anyChecked) {
                    cb.checked = true;
                    cardCb = cb.value 
                }

            if(cb.checked) cardCb = cb.value
        })
    })

    checkboxes.forEach(checkbox => {
        localStorage.clear()

        //onload output default
        if(checkbox.checked) checkedValue = checkbox.value
        outputValue.innerHTML = checkedValue

        checkbox.addEventListener('change', () => {
            checkboxes.forEach(cb => {
                //disable multiple choice
                if(cb !== checkbox) cb.checked = false;

                //one checked at any time
                const anyChecked = Array.from(checkboxes).some(cb => cb.checked);
                if (!anyChecked) {
                    checkbox.checked = true;
                    checkedValue = checkbox.value
                    outputValue.innerHTML = checkedValue
                }
                
                //custom value
                if(cb.checked && cb.value === '0') {
                    document.querySelector(".customValue").classList.remove('display-none')
                    document.querySelector(".customValue input").focus();
                    }
                else {
                    document.querySelector(".customValue").classList.add('display-none')
                }
                
                //get and output value when changed
                if(checkbox.checked && checkbox.value != '0') checkedValue = checkbox.value
                outputValue.innerHTML = checkedValue
            });
        })
    });

    customInputField.addEventListener('blur', handleCustomValue)
 
    function handleCustomValue() {
        let customValue = customInputField.value

        if(customValue < 200 || customValue > 5000) {
            console.log('sad')
            customInputError.classList.remove('display-none')
            customInputField.focus()
            return
        }
        customInputError.classList.add('display-none')
        checkedValue = customValue
        outputValue.innerHTML = customValue
    }

    dataInputFields.forEach(inputField => {
        inputField.addEventListener('input', () => {
            clearTimeout(typingTimer);
            typingTimer = setTimeout(errorHandler, 300);
        })
    });  

    function errorHandler () {

        if(numberInput.value !== '' && !regexNum.test(numberInput.value)) {
            numberError.innerHTML = 'Unesite broj u formatu 06XXXXXXX'
            numberError.classList.remove('display-none')
        }
        else numberError.classList.add('display-none')


        if(confirmInput.value !== '' && numberInput.value !== confirmInput.value) {
            confirmError.innerHTML = 'Brojevi nisu isti.'
            confirmError.classList.remove('display-none')
        }
        else confirmError.classList.add('display-none')
        

        if(emailInput.value != '' && !regexEmail.test(emailInput.value)) {
            emailError.innerHTML = 'E-mail nije u ispravnom formatu.'
            emailError.classList.remove('display-none')
        }
        else emailError.classList.add('display-none')
        

    } 
    
    agreementCb.addEventListener('change', () => {
        if(!agreementCb.checked) {            
            agreeError.innerHTML = 'Polje mora biti označeno.'
            agreeError.classList.remove('display-none')
            agreeResult = false
        }
        else {
            agreeError.classList.add('display-none')
            agreeResult = true;
        }
    })

    document.getElementById('submitButton').addEventListener('click', handleFormSubmit)

    function handleFormSubmit(e) {
        e.preventDefault()
            
        let data = []
        let errors = []

        //checkbox validation
        checkedValue > 0 && checkedValue ? data.push(checkedValue) : errors.push("Nije dobar iznos")

        //input form validation
        if(numberInput.value === '') {
            numberError.innerHTML = 'Broj telefona je obavezno polje.'
            numberError.classList.remove('display-none')
            errors.push("Broj nije ispravan.")
        }
        else data.push(numberInput.value)

        if(confirmInput.value === '') {
            confirmError.innerHTML = 'Morate potvrditi broj.'
            confirmError.classList.remove('display-none')
            errors.push("Brojevi nisu isti.") 
        }

        if(emailInput.value === '') {
            emailError.innerHTML = 'E-mail adresa je obavezna.'
            emailError.classList.remove('display-none')
            errors.push("Email nije ispravan.")
        }
        else data.push(emailInput.value)

        data.push(document.querySelector(".inputData textarea").value)

        //agree validation
        if(!agreeResult) {
            agreeError.innerHTML = 'Polje mora biti označeno.'
            agreeError.classList.remove('display-none')
            errors.push("Uslovi kupovine nisu potvrdjeni")
        }
        else {
            data.push(agreeResult)
            agreeError.classList.add('display-none')
        }

        if(errors.length === 0 && data.length === 0) return
        if(errors.length > 0) return
        let keys = ['amount', 'number', 'email', 'message', 'agree']
        if(data.length === keys.length) {
            for(let i = 0; i < data.length; i++ ) {
                localStorage.setItem(keys[i], data[i])
            }
        }

        document.querySelector('#step2').classList.remove('display-none')
        document.querySelector('#step1').classList.add('display-none')
        document.getElementById('step2').scrollIntoView({ behavior: "smooth"});
        handleOutput()
    }

    function handleOutput() {
        for(let i = 0; i < localStorage.length; i++) {
            let key = localStorage.key(i)
            let value = localStorage.getItem(key)
            data[key] = value     
        }
        let dataOutput = {'Vrednost dopune': `${data.amount} RSD`, 'Broj telefona':data.number, 'E-mail adresa':data.email}


        let dataHtmlOutput = '<ul>';
        for (let key in dataOutput) {
            if (dataOutput.hasOwnProperty(key)) {  
                dataHtmlOutput += `<li><span>${key}:</span> <span class='key'>${dataOutput[key]}</span></li>`
            }
        }
        dataOutput += '</ul>'

        document.getElementById('data').innerHTML = dataHtmlOutput
    }
    

    document.getElementById('confirmDataButton').addEventListener('click', () => {
        document.getElementById('payment').scrollIntoView({ behavior: "smooth", offset: 200});
    })

    document.getElementById('backButton').addEventListener('click', () => { 
        step1.classList.remove('display-none')
        document.getElementById('step1').scrollIntoView({ behavior: "smooth"});
        step2.classList.add('display-none');
    })

    document.getElementById('continueToPaymentButton').addEventListener('click', () => {
        if(cardCb === 'newCard') {
            document.querySelector('#newUser').classList.remove('display-none')
            document.querySelector('#step2').classList.add('display-none')

            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }

        if(cardCb === 'oldCard') {
            document.getElementById('step2').classList.add('display-none');
            document.getElementById('oldUser').classList.remove('display-none')

            window.scrollTo({
                top: 0,
                behavior: 'smooth' 
            });
        }
    })

    let newUserInput = document.querySelectorAll('#newUser input');
    let timer;
    newUserInput.forEach(input => {
        input.addEventListener('input', () =>{
            clearTimeout(timer);
            timer = setTimeout(handleErrors, 300);
        })
    })

    let name = document.getElementById('name')
    let lastName = document.getElementById('lastName')
    let cardNum = document.getElementById('cardNum')

    let nameErr = document.querySelector('.errorName')
    let lastNameErr = document.querySelector('.errorLastName')
    let cardNumErr = document.querySelector('.errorCardNum')
    
    function handleErrors () {
        let regName = /^[A-z]{1,30}$/
        let regCardNumber = /^[0-9]{16}$/
        let name = document.getElementById('name')
        let lastName = document.getElementById('lastName')
        let cardNum = document.getElementById('cardNum')
    
        if(name.value !== '' && !regName.test(name.value)) {
            nameErr.innerHTML = 'Ime mora imati samo karaktere.'
            nameErr.classList.remove('display-none')
        }
        else nameErr.classList.add('display-none')
        
        if(lastName.value !== '' && !regName.test(lastName.value)) {
            lastNameErr.innerHTML = 'Prezime mora imati samo karaktere.'
            lastNameErr.classList.remove('display-none')
        }
        else lastNameErr.classList.add('display-none')

        if(cardNum.value !== '' && !regCardNumber.test(cardNum.value)) {
            cardNumErr.innerHTML = 'Broj kartice mora imati 16 brojeva.'
            cardNumErr.classList.remove('display-none')
        }
        else cardNumErr.classList.add('display-none')
    }

    document.getElementById("loginButton").addEventListener('click', returnToMainPage)
    document.getElementById('newPaymentButton').addEventListener('click', returnToMainPage)

    document.getElementById("finishButton").addEventListener('click', () => {
        let errors = []
        if(name.value === '') {
            nameErr.classList.remove('display-none')
            nameErr.innerHTML = 'Morate uneti ime.'
            name.focus()
            errors.push("Ime")
        }
        else nameErr.classList.add('display-none')

        if(lastName.value === '') {
            lastNameErr.innerHTML = 'Morate uneti prezime.'
            lastNameErr.classList.remove('display-none')
            lastName.focus()
            errors.push("Prezime")
        }
        else lastNameErr.classList.add('display-block')

        if(cardNum.value === '') {
            cardNumErr.classList.remove('display-none')
            cardNumErr.innerHTML = 'Morate uneti broj kartice.'
            cardNum.focus()
            errors.push("Num")
        }
        else cardNumErr.classList.add('display-block')

        if(errors.length !== 0) return

        document.querySelector('#last').classList.remove('display-none');
        document.querySelector("#finishNum").innerHTML = data.number;
        document.querySelector("#newUser").classList.add('display-none');
        document.getElementById('last').scrollIntoView({ behavior: "smooth"});
        window.scrollTo({
            top: 0,
            behavior: 'smooth' 
        });
    })

    function returnToMainPage () {
        document.querySelector("#step1").classList.remove('display-none');
        document.querySelector('#oldUser').classList.add('display-none')
        document.querySelector('#newUser').classList.add('display-none')
        document.querySelector('#last').classList.add('display-none')
        document.getElementById('step1').scrollIntoView({ behavior: "smooth"});
        
        window.scrollTo({
            top: 0,
            behavior: 'smooth' 
        });

        document.getElementById('number').value = ''
        document.getElementById('confirmNumber').value = ''
        document.getElementById('email').value = ''
        document.getElementById('agree').checked = false
    }
}