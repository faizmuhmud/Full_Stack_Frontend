const { createApp } = Vue;

createApp({
    data() {
        return {
            appName: "After School Classes",
            currentPage: "lessons",
            cart: [],
            searchQuery: "",
            sortBy: "",
            sortOrder: "asc",
            
            customer: {
                firstName: "",
                lastName: "",
                city: "",
                address: "",
                postal: ""
            },

            errors: {
                firstName: "",
                lastName: "",
                city: "",
                address: "",
                postal: ""
            },
            
            lessons: [
                { id: 1, subject: "Mathematics", location: "Dubai", price: 150, spaces: 5, image: "https://via.placeholder.com/300x200?text=Math" },
                { id: 2, subject: "English", location: "Abu Dhabi", price: 120, spaces: 8, image: "https://via.placeholder.com/300x200?text=English" },
                { id: 3, subject: "Science", location: "Sharjah", price: 180, spaces: 3, image: "https://via.placeholder.com/300x200?text=Science" },
                { id: 4, subject: "Art", location: "Dubai", price: 100, spaces: 10, image: "https://via.placeholder.com/300x200?text=Art" },
                { id: 5, subject: "Music", location: "Ajman", price: 130, spaces: 6, image: "https://via.placeholder.com/300x200?text=Music" },
                { id: 6, subject: "History", location: "Dubai", price: 140, spaces: 7, image: "https://via.placeholder.com/300x200?text=History" },
                { id: 7, subject: "Geography", location: "Sharjah", price: 135, spaces: 4, image: "https://via.placeholder.com/300x200?text=Geography" },
                { id: 8, subject: "Physics", location: "Abu Dhabi", price: 170, spaces: 5, image: "https://via.placeholder.com/300x200?text=Physics" }
            ]
        };
    },

    computed: {
        cartCount() {
            return this.cart.reduce((acc, item) => acc + item.qty, 0);
        },

        cartTotal() {
            return this.cart.reduce((sum, item) => sum + item.price * item.qty, 0);
        },

        filteredAndSortedLessons() {
            let list = [...this.lessons];

            if (this.searchQuery) {
                const query = this.searchQuery.toLowerCase();
                list = list.filter(lesson => 
                    lesson.subject.toLowerCase().includes(query) ||
                    lesson.location.toLowerCase().includes(query)
                );
            }

            if (this.sortBy) {
                list.sort((a, b) => {
                    let compareValue = 0;

                    if (this.sortBy === "subject") {
                        compareValue = a.subject.localeCompare(b.subject);
                    } else if (this.sortBy === "location") {
                        compareValue = a.location.localeCompare(b.location);
                    } else if (this.sortBy === "price") {
                        compareValue = a.price - b.price;
                    } else if (this.sortBy === "availability") {
                        compareValue = a.spaces - b.spaces;
                    }

                    return this.sortOrder === "asc" ? compareValue : -compareValue;
                });
            }

            return list;
        }
    },

    methods: {
        showLessons() { 
            this.currentPage = "lessons"; 
        },
        
        showCart() { 
            this.currentPage = "cart"; 
        },

        showCheckout() { 
            this.currentPage = "checkout"; 
        },

        validateField(field) {
            this.errors[field] = "";

            switch(field) {
                case 'firstName':
                    if (!this.customer.firstName.trim()) {
                        this.errors.firstName = "First Name is required";
                    } else if (this.customer.firstName.trim().length < 2) {
                        this.errors.firstName = "Must be at least 2 characters";
                    } else if (!/^[a-zA-Z\s]+$/.test(this.customer.firstName)) {
                        this.errors.firstName = "Can only contain letters";
                    }
                    break;

                case 'lastName':
                    if (!this.customer.lastName.trim()) {
                        this.errors.lastName = "Last Name is required";
                    } else if (this.customer.lastName.trim().length < 2) {
                        this.errors.lastName = "Must be at least 2 characters";
                    } else if (!/^[a-zA-Z\s]+$/.test(this.customer.lastName)) {
                        this.errors.lastName = "Can only contain letters";
                    }
                    break;

                case 'city':
                    if (!this.customer.city.trim()) {
                        this.errors.city = "City is required";
                    } else if (this.customer.city.trim().length < 2) {
                        this.errors.city = "Must be at least 2 characters";
                    } else if (!/^[a-zA-Z\s]+$/.test(this.customer.city)) {
                        this.errors.city = "Can only contain letters";
                    }
                    break;

                case 'address':
                    if (!this.customer.address.trim()) {
                        this.errors.address = "Address is required";
                    } else if (this.customer.address.trim().length < 5) {
                        this.errors.address = "Must be at least 5 characters";
                    }
                    break;

                case 'postal':
                    if (!this.customer.postal.trim()) {
                        this.errors.postal = "Postal Code is required";
                    } else if (!/^\d{5,6}$/.test(this.customer.postal.trim())) {
                        this.errors.postal = "Must be 5 or 6 digits";
                    }
                    break;
            }
        },

        validateForm() {
            this.validateField('firstName');
            this.validateField('lastName');
            this.validateField('city');
            this.validateField('address');
            this.validateField('postal');

            return !Object.values(this.errors).some(error => error !== "");
        },

        submitOrder() {
            if (!this.validateForm()) {
                alert("Please fix all errors before submitting");
                return;
            }

            alert("Order Completed! 🎉\n\nThank you for your order, " + this.customer.firstName + "!");
            
            this.cart = [];
            this.customer = {
                firstName: "",
                lastName: "",
                city: "",
                address: "",
                postal: ""
            };
            this.errors = {
                firstName: "",
                lastName: "",
                city: "",
                address: "",
                postal: ""
            };
            this.currentPage = "lessons";
        },

        addToCart(lesson) {
            const found = this.cart.find(i => i.id === lesson.id);
            
            if (found) {
                found.qty++;
            } else {
                this.cart.push({ 
                    ...lesson, 
                    qty: 1 
                });
            }
            
            lesson.spaces--;
        },

        increaseQty(item) {
            const lesson = this.lessons.find(l => l.id === item.id);
            if (lesson.spaces > 0) {
                item.qty++;
                lesson.spaces--;
            }
        },

        decreaseQty(item) {
            if (item.qty > 1) {
                item.qty--;
                const lesson = this.lessons.find(l => l.id === item.id);
                lesson.spaces++;
            }
        },

        removeLesson(item) {
            const lesson = this.lessons.find(l => l.id === item.id);
            lesson.spaces += item.qty;
            this.cart = this.cart.filter(i => i.id !== item.id);
        }
    }
}).mount("#app");