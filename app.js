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

            // Filter by search query
            if (this.searchQuery) {
                const query = this.searchQuery.toLowerCase();
                list = list.filter(lesson => 
                    lesson.subject.toLowerCase().includes(query) ||
                    lesson.location.toLowerCase().includes(query)
                );
            }

            // Sort
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