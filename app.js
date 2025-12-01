const { createApp } = Vue;

createApp({
    data() {
        return {
            appName: "After School Classes",
            currentPage: "lessons",
            apiUrl: "http://localhost:3000",

            searchQuery: "",
            sortBy: "",
            sortOrder: "asc",
            cart: [],

            customer: {
                firstName: "",
                lastName: "",
                city: "",
                address: "",
                postal: "",
                isGift: false  
            },

            errors: {
                firstName: "",
                lastName: "",
                city: "",
                address: "",
                postal: ""
            },

            lessons: [],
            loading: true,
            error: null
        };
    },

    mounted() {
        this.fetchLessons();
    },

    computed: {
        cartCount() {
            return this.cart.reduce((acc, item) => acc + item.qty, 0);
        },

        cartTotal() {
            return this.cart.reduce((sum, item) => sum + item.price * item.qty, 0);
        },

        sortedLessons() {
            let list = [...this.lessons];

            if (!this.sortBy) return list;

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

            return list;
        }
    },

    watch: {
        searchQuery(newQuery) {
            this.performSearch(newQuery);
        }
    },

    methods: {
        async fetchLessons() {
            try {
                this.loading = true;
                const response = await fetch(`${this.apiUrl}/collection/lessons`);
                if (!response.ok) throw new Error('Failed to fetch lessons');
                this.lessons = await response.json();
                this.loading = false;
            } catch (err) {
                this.error = err.message;
                this.loading = false;
                console.error('Error fetching lessons:', err);
            }
        },

        async performSearch(query) {
            try {
                this.loading = true;
                
                if (!query || query.trim() === '') {
                    await this.fetchLessons();
                    return;
                }

                const response = await fetch(`${this.apiUrl}/search/lessons?q=${encodeURIComponent(query)}`);
                if (!response.ok) throw new Error('Failed to search lessons');
                this.lessons = await response.json();
                this.loading = false;
            } catch (err) {
                this.error = err.message;
                this.loading = false;
                console.error('Error searching lessons:', err);
            }
        },

        async updateLessonSpaces(lessonId, newSpaces) {
            try {
                const response = await fetch(`${this.apiUrl}/collection/lessons/${lessonId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ spaces: newSpaces })
                });
                
                if (!response.ok) throw new Error('Failed to update lesson');
                const result = await response.json();
                return result;
            } catch (err) {
                console.error('Error updating lesson:', err);
                alert('Failed to update lesson availability');
            }
        },

        async submitOrderToServer(orderData) {
            try {
                const response = await fetch(`${this.apiUrl}/orders`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(orderData)
                });
                
                if (!response.ok) throw new Error('Failed to submit order');
                const result = await response.json();
                return result;
            } catch (err) {
                console.error('Error submitting order:', err);
                throw err;
            }
        },

        showLessons() { this.currentPage = "lessons"; },
        showCart() { this.currentPage = "cart"; },
        showCheckout() { this.currentPage = "checkout"; },

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

        async addToCart(lesson) {
            const found = this.cart.find(i => i.id === lesson.id || i._id === lesson._id);

            if (found) {
                found.qty++;
            } else {
                this.cart.push({ 
                    ...lesson, 
                    id: lesson._id || lesson.id,
                    qty: 1 
                });
            }

            lesson.spaces--;
            
            await this.updateLessonSpaces(lesson._id, lesson.spaces);
        },

        async increaseQty(item) {
            const lesson = this.lessons.find(l => (l._id || l.id) === (item._id || item.id));
            if (lesson.spaces > 0) {
                item.qty++;
                lesson.spaces--;
                await this.updateLessonSpaces(lesson._id, lesson.spaces);
            }
        },

        async decreaseQty(item) {
            if (item.qty > 1) {
                item.qty--;
                const lesson = this.lessons.find(l => (l._id || l.id) === (item._id || item.id));
                lesson.spaces++;
                await this.updateLessonSpaces(lesson._id, lesson.spaces);
            }
        },

        async removeLesson(item) {
            const lesson = this.lessons.find(l => (l._id || l.id) === (item._id || item.id));
            lesson.spaces += item.qty;
            await this.updateLessonSpaces(lesson._id, lesson.spaces);
            this.cart = this.cart.filter(i => (i._id || i.id) !== (item._id || item.id));
        },

        validateForm() {
            this.validateField('firstName');
            this.validateField('lastName');
            this.validateField('city');
            this.validateField('address');
            this.validateField('postal');

            return !Object.values(this.errors).some(error => error !== "");
        },

        async submitOrder() {
            if (!this.validateForm()) {
                alert("Please fix all errors before submitting");
                return;
            }

            try {
                const orderData = {
                    customer: { ...this.customer },
                    items: this.cart.map(item => ({
                        lessonId: item._id || item.id,
                        subject: item.subject,
                        location: item.location,
                        price: item.price,
                        qty: item.qty
                    })),
                    total: this.cartTotal
                };

                const result = await this.submitOrderToServer(orderData);

                if (result.success) {
                    alert("Order Completed! 🎉\n\nThank you for your order, " + this.customer.firstName + "!");
                    
                    this.cart = [];
                    this.customer = {
                        firstName: "",
                        lastName: "",
                        city: "",
                        address: "",
                        postal: "",
                        isGift: false  // RESET isGift
                    };
                    this.errors = {
                        firstName: "",
                        lastName: "",
                        city: "",
                        address: "",
                        postal: ""
                    };
                    this.currentPage = "lessons";
                }
            } catch (err) {
                alert("Failed to submit order. Please try again.");
                console.error('Order submission error:', err);
            }
        }
    }
}).mount("#app");