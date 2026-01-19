import $ from 'jquery';
import '../css/styles.css';

// Application State
const AppState = {
    tours: [],
    destinations: [],
    testimonials: [],
    currentSlide: 0,
    currentTestimonial: 0,
    visibleTours: 6
};

// DOM Ready
$(document).ready(function () {
    initApp();
});

// Initialize Application
function initApp() {
    showLoading();
    loadAllData();
    setupEventListeners();
    initHeroSlider();
    initSmoothScroll();
    setupScrollToTop();
    setupStickyHeader();
}

// Data Loading Functions
async function loadAllData() {
    try {
        await Promise.all([
            loadBookingForm(),
            loadTours(),
            loadDestinations(),
            loadTestimonials(),
            loadSlider(),
        ]);
        hideLoading();
    } catch (error) {
        console.error('Error loading data:', error);
        hideLoading();
        showError('Failed to load content. Please refresh the page.');
    }
}

async function loadTours() {
    try {
        const response = await fetch('data/tours.json');
        const data = await response.json();
        AppState.tours = data.featured;
        renderTours(AppState.tours.slice(0, AppState.visibleTours));
    } catch (error) {
        console.error('Error loading tours:', error);
    }
}

async function loadDestinations() {
    try {
        const response = await fetch('data/destinations.json');
        const data = await response.json();
        AppState.destinations = data.regions;
        renderDestinations(AppState.destinations);
    } catch (error) {
        console.error('Error loading destinations:', error);
    }
}

async function loadTestimonials() {
    try {
        const response = await fetch('data/testimonials.json');
        const data = await response.json();
        AppState.testimonials = data.reviews;
        renderTestimonials(AppState.testimonials);
    } catch (error) {
        console.error('Error loading testimonials:', error);
    }
}
// Function to fetch JSON
async function loadSlider() {
    try {
        const response = await fetch('data/homeslider.json');
        const data = await response.json();

        // Pass the slider array to the render function
        renderSlider(data.slider);
    } catch (error) {
        console.error('Error loading slider:', error);
    }
}

let bookingFormLink = '';

async function loadBookingForm() {
    try {
        const response = await fetch('data/zohoformurl.json');
        const data = await response.json();
        bookingFormLink = data.bookingForm;
    } catch (error) {
        console.error('Error loading booking form link:', error);
    }
}



// Render Functions


// Function to render slides
function renderSlider(slides) {
    const sliderContainer = document.getElementById('hero-slider');
    sliderContainer.innerHTML = ''; // Clear any existing slides

    slides.forEach((slide, index) => {
        const slideDiv = document.createElement('div');
        slideDiv.className = 'hero-slide' + (index === 0 ? ' active' : '');
        slideDiv.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('${slide.image}')`;

        const buttonsHtml = slide.buttons.map(btn =>
            `<a href="${btn.link}" class="btn ${btn.class} btn-large">${btn.text}</a>`
        ).join(' ');

        slideDiv.innerHTML = `
            <div class="container">
                <div class="hero-content">
                    <h1 class="hero-title">${slide.title}</h1>
                    <p class="hero-subtitle">${slide.subtitle}</p>
                    <div class="hero-buttons">${buttonsHtml}</div>
                </div>
            </div>
        `;

        sliderContainer.appendChild(slideDiv);
    });
}


function renderTours(tours) {
    const grid = $('#tours-grid');
    grid.empty();

    tours.forEach(tour => {
        const card = createTourCard(tour);
        grid.append(card);
    });

    // Animate cards
    $('.tour-card').each(function (index) {
        $(this).css({
            opacity: 0,
            transform: 'translateY(30px)'
        }).delay(index * 100).animate({
            opacity: 1
        }, 500).css({
            transform: 'translateY(0)'
        });
    });

    // Update load more button visibility
    if (AppState.visibleTours >= AppState.tours.length) {
        $('#load-more-tours').hide();
    } else {
        $('#load-more-tours').show();
    }
}

function createTourCard(tour) {
    const stars = '★'.repeat(Math.floor(tour.rating));

    // Use local image if exists, else fallback to Unsplash
    const imageUrl = tour.image || `https://source.unsplash.com/600x400/?mauritius,tour,${tour.id}`;

    return $(`
        <div class="tour-card" data-tour-id="${tour.id}">
            <div class="tour-image">
                <img src="${imageUrl}" alt="${tour.title}">
                <span class="tour-badge">${tour.duration}</span>
            </div>
            <div class="tour-content">
                <div class="tour-header">
                    <div>
                        <h3 class="tour-title">${tour.title}</h3>
                    </div>
                    <div class="tour-price">
                        $${tour.price}
                        <span>/person</span>
                    </div>
                </div>
                <div class="tour-rating">
                    <span>${stars}</span>
                    <span>(${tour.reviews} reviews)</span>
                </div>
                <p class="tour-description">${tour.description}</p>
                <div class="tour-footer">
                    <button class="btn btn-primary btn-book" data-tour="${tour.title}">
                        Book Now
                    </button>
                </div>
            </div>
        </div>
    `);
}


function renderDestinations(destinations) {
    const grid = $('#destinations-grid');
    grid.empty();

    destinations.forEach(dest => {
        const card = createDestinationCard(dest);
        grid.append(card);
    });
}

function createDestinationCard(dest) {
    // Use the provided destination image
    const imageUrl = dest.image;

    // Map attractions with optional images if available
    const attractionTags = dest.attractions.map(attr => {
        if (typeof attr === 'object') {
            return `<span class="attraction-tag">
                        <img src="${attr.image}" alt="${attr.name}" class="attraction-icon">
                        ${attr.name}
                    </span>`;
        } else {
            return `<span class="attraction-tag">${attr}</span>`;
        }
    }).join('');

    return $(`
        <div class="destination-card">
            <img src="${imageUrl}" alt="${dest.name}" class="destination-image">
            <div class="destination-content">
                <h3 class="destination-name">${dest.name}</h3>
                <p class="destination-desc">${dest.description}</p>
                <div class="destination-attractions">
                    ${attractionTags}
                </div>
            </div>
        </div>
    `);
}


function renderTestimonials(testimonials) {
    const slider = $('#testimonials-slider');
    slider.empty();

    testimonials.forEach((testimonial, index) => {
        const card = createTestimonialCard(testimonial, index === 0);
        slider.append(card);
    });
}

function createTestimonialCard(testimonial, isActive) {
    const stars = '★'.repeat(testimonial.rating);

    return $(`
        <div class="testimonial-card ${isActive ? 'active' : ''}">
            <div class="testimonial-stars">${stars}</div>
            <p class="testimonial-text">"${testimonial.comment}"</p>
            <div class="testimonial-author">
                <div class="author-info">
                    <h4>${testimonial.name}</h4>
                    <p>${testimonial.country} • ${testimonial.date}</p>
                    <p><em>${testimonial.tour}</em></p>
                </div>
            </div>
        </div>
    `);
}

// Hero Slider
function initHeroSlider() {
    const slides = $('.hero-slide');
    const totalSlides = slides.length;

    // Create dots
    const dotsContainer = $('.slider-dots');
    for (let i = 0; i < totalSlides; i++) {
        const dot = $(`<button class="slider-dot ${i === 0 ? 'active' : ''}" data-slide="${i}"></button>`);
        dotsContainer.append(dot);
    }

    // Auto slide
    setInterval(() => {
        nextSlide();
    }, 5000);
}

function goToSlide(index) {
    const slides = $('.hero-slide');
    const dots = $('.slider-dot');

    slides.removeClass('active');
    dots.removeClass('active');

    $(slides[index]).addClass('active');
    $(dots[index]).addClass('active');

    AppState.currentSlide = index;
}

function nextSlide() {
    const totalSlides = $('.hero-slide').length;
    const nextIndex = (AppState.currentSlide + 1) % totalSlides;
    goToSlide(nextIndex);
}

function prevSlide() {
    const totalSlides = $('.hero-slide').length;
    const prevIndex = (AppState.currentSlide - 1 + totalSlides) % totalSlides;
    goToSlide(prevIndex);
}

// Testimonial Slider
function nextTestimonial() {
    const testimonials = $('.testimonial-card');
    const totalTestimonials = testimonials.length;

    testimonials.removeClass('active');
    AppState.currentTestimonial = (AppState.currentTestimonial + 1) % totalTestimonials;
    $(testimonials[AppState.currentTestimonial]).addClass('active');
}

function prevTestimonial() {
    const testimonials = $('.testimonial-card');
    const totalTestimonials = testimonials.length;

    testimonials.removeClass('active');
    AppState.currentTestimonial = (AppState.currentTestimonial - 1 + totalTestimonials) % totalTestimonials;
    $(testimonials[AppState.currentTestimonial]).addClass('active');
}

// Event Listeners
function setupEventListeners() {
    // Mobile menu toggle
    $('.mobile-menu-toggle').on('click', function () {
        $(this).toggleClass('active');
        $('.nav-menu').toggleClass('active');
    });

    // Close mobile menu on link click
    $('.nav-link').on('click', function () {
        $('.mobile-menu-toggle').removeClass('active');
        $('.nav-menu').removeClass('active');
    });

    // Hero slider controls
    $('.next-slide').on('click', nextSlide);
    $('.prev-slide').on('click', prevSlide);
    $(document).on('click', '.slider-dot', function () {
        const slideIndex = $(this).data('slide');
        goToSlide(slideIndex);
    });

    // Testimonial controls
    $('.next-testimonial').on('click', nextTestimonial);
    $('.prev-testimonial').on('click', prevTestimonial);

    // Filter buttons
    $('.filter-btn').on('click', function () {
        $('.filter-btn').removeClass('active');
        $(this).addClass('active');

        const filter = $(this).data('filter');
        filterTours(filter);
    });

    // Load more tours
    $('#load-more-tours').on('click', function () {
        AppState.visibleTours += 3;
        renderTours(AppState.tours.slice(0, AppState.visibleTours));
    });


    function openBookingModal(tourName = '') {
        $('#modal-tour-name').val(tourName);
        $('#booking-modal').addClass('active');
        $('body').css('overflow', 'hidden');
        $('#zoho-booking-form').attr('src', bookingFormLink);
    }

    function closeBookingModal() {
        $('#booking-modal').removeClass('active');
        $('body').css('overflow', '');
    }

    // Header Book Now
    $('#open-booking-modal').on('click', function () {
        openBookingModal('');
    });

    // Tour card Book Now
    $(document).on('click', '.btn-book', function () {
        const tour = $(this).data('tour') || '';
        openBookingModal(tour);
    });

    // Close button
    $('.modal-close').on('click', closeBookingModal);

    // Outside click
    $('#booking-modal').on('click', function (e) {
        if (e.target === this) closeBookingModal();
    });

    // ESC key
    $(document).on('keydown', function (e) {
        if (e.key === 'Escape') closeBookingModal();
    });

    // Contact form
    $('#contact-form').on('submit', function (e) {
        e.preventDefault();
        handleContactForm(this);
    });

    // Booking form
    $('#booking-form').on('submit', function (e) {
        e.preventDefault();
        handleBookingForm(this);
    });

    // Newsletter form
    $('.newsletter-form').on('submit', function (e) {
        e.preventDefault();
        handleNewsletterForm(this);
    });
}

// Filter Tours
function filterTours(filter) {
    if (filter === 'all') {
        renderTours(AppState.tours.slice(0, AppState.visibleTours));
        return;
    }

    const filtered = AppState.tours.filter(tour => {
        const title = tour.title.toLowerCase();
        const desc = tour.description.toLowerCase();
        const filterLower = filter.toLowerCase();

        if (filter === 'beach') {
            return title.includes('beach') || title.includes('catamaran') ||
                title.includes('cruise') || desc.includes('beach') ||
                title.includes('cerfs') || desc.includes('lagoon');
        }
        if (filter === 'adventure') {
            return title.includes('walk') || title.includes('trek') ||
                title.includes('adventure') || title.includes('falls') ||
                desc.includes('adventure') || desc.includes('trek');
        }
        if (filter === 'culture') {
            return title.includes('island') || title.includes('coast') ||
                title.includes('discovery') || desc.includes('market') ||
                desc.includes('historic');
        }
        if (filter === 'luxury') {
            return tour.price > 80;
        }

        return true;
    });

    renderTours(filtered);
}

// // Modal Functions
// function openBookingModal(tourName) {
//     $('#modal-tour-name').val(tourName);
//     $('#booking-modal').addClass('active');
//     $('body').css('overflow', 'hidden');
// }

// function closeBookingModal() {
//     $('#booking-modal').removeClass('active');
//     $('body').css('overflow', 'auto');
// }

// Form Handlers
function handleContactForm(form) {
    showLoading();

    setTimeout(() => {
        hideLoading();
        $(form)[0].reset();
        showNotification('Thank you! We will get back to you soon.', 'success');
    }, 1500);
}

function handleBookingForm(form) {
    showLoading();

    setTimeout(() => {
        hideLoading();
        closeBookingModal();
        $(form)[0].reset();
        showNotification('Booking request submitted successfully! We will contact you shortly.', 'success');
    }, 1500);
}

function handleNewsletterForm(form) {
    showLoading();

    setTimeout(() => {
        hideLoading();
        $(form)[0].reset();
        showNotification('Successfully subscribed to our newsletter!', 'success');
    }, 1000);
}

// UI Helper Functions
function showLoading() {
    $('#loading-spinner').addClass('active');
}

function hideLoading() {
    $('#loading-spinner').removeClass('active');
}

function showError(message) {
    showNotification(message, 'error');
}

function showNotification(message, type = 'success') {
    const bgColor = type === 'success' ? '#06d6a0' : '#ff6b6b';

    const notification = $(`
        <div style="
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${bgColor};
            color: white;
            padding: 20px 30px;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        ">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            ${message}
        </div>
    `);

    $('body').append(notification);

    setTimeout(() => {
        notification.fadeOut(300, function () {
            $(this).remove();
        });
    }, 3000);
}

// Smooth Scroll
function initSmoothScroll() {
    $('a[href^="#"]').on('click', function (e) {
        const target = $(this.getAttribute('href'));

        if (target.length) {
            e.preventDefault();

            $('html, body').stop().animate({
                scrollTop: target.offset().top - 80
            }, 1000);

            // Update active nav link
            $('.nav-link').removeClass('active');
            $(`.nav-link[href="${this.getAttribute('href')}"]`).addClass('active');
        }
    });

    // Update active link on scroll
    $(window).on('scroll', function () {
        const scrollPos = $(window).scrollTop() + 100;

        $('section[id]').each(function () {
            const section = $(this);
            const sectionTop = section.offset().top;
            const sectionBottom = sectionTop + section.outerHeight();

            if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
                const id = section.attr('id');
                $('.nav-link').removeClass('active');
                $(`.nav-link[href="#${id}"]`).addClass('active');
            }
        });
    });
}

// Scroll to Top Button
function setupScrollToTop() {
    const scrollBtn = $('#scroll-to-top');

    $(window).on('scroll', function () {
        if ($(window).scrollTop() > 500) {
            scrollBtn.addClass('visible');
        } else {
            scrollBtn.removeClass('visible');
        }
    });

    scrollBtn.on('click', function () {
        $('html, body').animate({ scrollTop: 0 }, 800);
    });
}

// Sticky Header
function setupStickyHeader() {
    $(window).on('scroll', function () {
        if ($(window).scrollTop() > 100) {
            $('.header').addClass('scrolled');
        } else {
            $('.header').removeClass('scrolled');
        }
    });
}

// Utility Functions
function getRandomImageId() {
    const imageIds = [
        '1589553416260-f586c8f1514f',
        '1544551763-46a013bb70d5',
        '1602002418082-a4443e081dd1',
        '1559827260-dc66d52bef19',
        '1590073242678-70ee3fc28e8e',
        '1605640840605-14ac1855827b',
        '1583417319070-4a69db38a482',
        '1590523278191-2b472f6aecfc'
    ];

    return imageIds[Math.floor(Math.random() * imageIds.length)];
}

// Add keydown event for slider
$(document).on('keydown', function (e) {
    if (e.key === 'ArrowLeft') {
        prevSlide();
    } else if (e.key === 'ArrowRight') {
        nextSlide();
    }
});

// Intersection Observer for fade-in animations
if ('IntersectionObserver' in window) {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                $(entry.target).addClass('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements
    setTimeout(() => {
        $('.feature-card, .tour-card, .destination-card').each(function () {
            observer.observe(this);
        });
    }, 1000);
}