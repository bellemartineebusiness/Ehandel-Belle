/* ================================================
   Belle Martineé E-handel – Interaktivitet
   ================================================ */

(function () {
  'use strict';

  /* ── Intro Curtain ──────────────────────────── */
  var CURTAIN_HOLD_MS   = 1800; // how long to show the intro logo
  var CURTAIN_REMOVE_MS = 1200; // matches the CSS panel transition duration
  var introCurtain = document.getElementById('intro-curtain');
  if (introCurtain) {
    setTimeout(function () {
      introCurtain.classList.add('done');
      setTimeout(function () {
        introCurtain.remove();
      }, CURTAIN_REMOVE_MS);
    }, CURTAIN_HOLD_MS);
  }

  /* ── Navbar scroll behaviour ─────────────────── */
  var header = document.getElementById('header');

  function handleScroll() {
    if (window.scrollY > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Scroll-to-top button
    var scrollBtn = document.getElementById('scrollTop');
    if (window.scrollY > 400) {
      scrollBtn.classList.add('visible');
    } else {
      scrollBtn.classList.remove('visible');
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  /* ── Mobile Menu ────────────────────────────── */
  var hamburger = document.getElementById('hamburger');
  var mobileMenu = document.getElementById('mobileMenu');
  var mobileMenuClose = document.getElementById('mobileMenuClose');
  var mobileLinks = mobileMenu.querySelectorAll('.mobile-link');

  function openMobileMenu() {
    mobileMenu.classList.add('open');
    document.body.style.overflow = 'hidden';
    mobileMenuClose.focus();
  }

  function closeMobileMenu() {
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
    hamburger.focus();
  }

  hamburger.addEventListener('click', openMobileMenu);
  mobileMenuClose.addEventListener('click', closeMobileMenu);

  mobileLinks.forEach(function (link) {
    link.addEventListener('click', closeMobileMenu);
  });

  // Close on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (mobileMenu.classList.contains('open')) closeMobileMenu();
      if (cartDrawer.classList.contains('open')) closeCart();
    }
  });

  /* ── Smooth scroll for nav links ────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        var headerHeight = header.offsetHeight;
        var top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 8;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });

  /* ── Scroll to top ──────────────────────────── */
  document.getElementById('scrollTop').addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ── Cart ───────────────────────────────────── */
  var cart = [];
  var cartBtn = document.getElementById('cartBtn');
  var cartDrawer = document.getElementById('cartDrawer');
  var cartOverlay = document.getElementById('cartOverlay');
  var cartClose = document.getElementById('cartClose');
  var cartContinue = document.getElementById('cartContinue');
  var cartCountEl = document.getElementById('cartCount');
  var cartItemsEl = document.getElementById('cartItems');
  var cartEmptyEl = document.getElementById('cartEmpty');
  var cartFooterEl = document.getElementById('cartFooter');
  var cartTotalEl = document.getElementById('cartTotal');

  function openCart() {
    cartDrawer.classList.add('open');
    cartOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    cartClose.focus();
  }

  function closeCart() {
    cartDrawer.classList.remove('open');
    cartOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  cartBtn.addEventListener('click', openCart);
  cartClose.addEventListener('click', closeCart);
  cartOverlay.addEventListener('click', closeCart);
  cartContinue.addEventListener('click', closeCart);

  function updateCart() {
    var total = cart.reduce(function (sum, item) {
      return sum + item.price * item.qty;
    }, 0);

    var totalQty = cart.reduce(function (sum, item) {
      return sum + item.qty;
    }, 0);

    // Update count badge
    cartCountEl.textContent = totalQty;
    if (totalQty > 0) {
      cartCountEl.classList.add('visible');
    } else {
      cartCountEl.classList.remove('visible');
    }

    // Update total
    cartTotalEl.textContent = total + ' kr';

    // Show/hide empty state
    if (cart.length === 0) {
      cartEmptyEl.style.display = 'block';
      cartFooterEl.style.display = 'none';
    } else {
      cartEmptyEl.style.display = 'none';
      cartFooterEl.style.display = 'block';
    }

    // Render items
    var existingItems = cartItemsEl.querySelectorAll('.cart-item');
    existingItems.forEach(function (el) {
      el.remove();
    });

    cart.forEach(function (item) {
      var div = document.createElement('div');
      div.className = 'cart-item';
      div.innerHTML =
        '<img src="' + escapeHtml(item.img) + '" alt="' + escapeHtml(item.name) + '" class="cart-item-img" />' +
        '<div class="cart-item-info">' +
          '<div class="cart-item-name">' + escapeHtml(item.name) + '</div>' +
          '<div class="cart-item-size">Storlek: ' + escapeHtml(item.size) + '</div>' +
          '<div class="cart-item-controls">' +
            '<button class="qty-btn" data-id="' + escapeHtml(item.id) + '" data-action="dec" aria-label="Minska antal">−</button>' +
            '<span class="qty-value">' + item.qty + '</span>' +
            '<button class="qty-btn" data-id="' + escapeHtml(item.id) + '" data-action="inc" aria-label="Öka antal">+</button>' +
          '</div>' +
        '</div>' +
        '<div class="cart-item-price">' + (item.price * item.qty) + ' kr</div>';
      cartItemsEl.appendChild(div);
    });

    // Bind qty buttons
    cartItemsEl.querySelectorAll('.qty-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = this.dataset.id;
        var action = this.dataset.action;
        var idx = cart.findIndex(function (i) { return i.id === id; });
        if (idx === -1) return;
        if (action === 'inc') {
          cart[idx].qty++;
        } else {
          cart[idx].qty--;
          if (cart[idx].qty <= 0) cart.splice(idx, 1);
        }
        updateCart();
      });
    });
  }

  function addToCart(name, price, img) {
    var activeSize = null;
    // Find the product card that triggered this
    var id = name.replace(/\s+/g, '-').toLowerCase();
    var existing = cart.find(function (i) { return i.id === id; });

    if (existing) {
      existing.qty++;
    } else {
      cart.push({ id: id, name: name, price: parseInt(price, 10), img: img, size: 'M', qty: 1 });
    }
    updateCart();
  }

  // Bind "Lägg i varukorg" buttons
  document.querySelectorAll('.product-quick-add').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var name = this.dataset.name;
      var price = this.dataset.price;
      var img = this.dataset.img;
      addToCart(name, price, img);
      showToast('✓ Tillagd i varukorgen!');
      openCart();
    });
  });

  /* ── Wishlist ───────────────────────────────── */
  document.querySelectorAll('.product-wishlist').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      this.classList.toggle('active');
      if (this.classList.contains('active')) {
        this.textContent = '♥';
        showToast('♥ Tillagd i önskelistan!');
      } else {
        this.textContent = '♡';
      }
    });
  });

  /* ── Size chips ─────────────────────────────── */
  document.querySelectorAll('.size-chip').forEach(function (chip) {
    chip.addEventListener('click', function (e) {
      e.stopPropagation();
      var siblings = this.closest('.size-options').querySelectorAll('.size-chip');
      siblings.forEach(function (s) { s.classList.remove('active'); });
      this.classList.add('active');
    });
  });

  /* ── Product filter ─────────────────────────── */
  var filterBtns = document.querySelectorAll('.filter-btn');
  var productCards = document.querySelectorAll('.product-card');

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterBtns.forEach(function (b) { b.classList.remove('active'); });
      this.classList.add('active');

      var filter = this.dataset.filter;

      productCards.forEach(function (card) {
        if (filter === 'alla') {
          card.style.display = 'block';
        } else {
          var categories = (card.dataset.category || '').split(' ');
          card.style.display = categories.indexOf(filter) !== -1 ? 'block' : 'none';
        }
      });
    });
  });

  /* ── Newsletter form ────────────────────────── */
  var newsletterForm = document.getElementById('newsletterForm');
  newsletterForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var input = this.querySelector('input[type="email"]');
    if (!input.value || !input.validity.valid) {
      showToast('⚠️ Ange en giltig e-postadress.');
      return;
    }
    input.value = '';
    showToast('🎉 Tack! Du prenumererar nu. 10% rabattkod skickas till din e-post.');
  });

  /* ── Contact form ───────────────────────────── */
  var contactForm = document.getElementById('contactForm');
  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var firstName = document.getElementById('firstName').value.trim();
    var email = document.getElementById('email').value.trim();
    var message = document.getElementById('message').value.trim();

    if (!firstName || !email || !message) {
      showToast('⚠️ Fyll i alla obligatoriska fält.');
      return;
    }

    contactForm.reset();
    showToast('✉️ Meddelande skickat! Vi återkommer inom 24 timmar.');
  });

  /* ── Toast notification ─────────────────────── */
  var toastEl = document.getElementById('toast');
  var toastTimer = null;

  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove('show');
    }, 3000);
  }

  /* ── Intersection Observer – fade in on scroll ─ */
  if ('IntersectionObserver' in window) {
    var style = document.createElement('style');
    style.textContent =
      '.fade-in { opacity: 0; transform: translateY(28px); transition: opacity 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94); }' +
      '.fade-in.visible { opacity: 1; transform: translateY(0); }';
    document.head.appendChild(style);

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    document.querySelectorAll('.product-card, .testimonial-card, .collection-card, .about-feature, .feature-item').forEach(function (el) {
      el.classList.add('fade-in');
      observer.observe(el);
    });
  }

  /* ── Helper: escape HTML ────────────────────── */
  function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  updateCart();
}());
