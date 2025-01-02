;; Holographic Content Marketplace Contract

(define-map listings
  { listing-id: uint }
  {
    seller: principal,
    token-id: uint,
    price: uint,
    active: bool
  }
)

(define-data-var listing-nonce uint u0)

(define-public (create-listing (token-id uint) (price uint))
  (let
    (
      (listing-id (+ (var-get listing-nonce) u1))
    )
    (map-set listings
      { listing-id: listing-id }
      {
        seller: tx-sender,
        token-id: token-id,
        price: price,
        active: true
      }
    )
    (var-set listing-nonce listing-id)
    (ok listing-id)
  )
)

(define-public (cancel-listing (listing-id uint))
  (let
    (
      (listing (unwrap! (map-get? listings { listing-id: listing-id }) (err u404)))
    )
    (asserts! (is-eq tx-sender (get seller listing)) (err u403))
    (asserts! (get active listing) (err u400))
    (ok (map-set listings
      { listing-id: listing-id }
      (merge listing { active: false })))
  )
)

(define-public (buy-listing (listing-id uint))
  (let
    (
      (listing (unwrap! (map-get? listings { listing-id: listing-id }) (err u404)))
    )
    (asserts! (get active listing) (err u400))
    (try! (stx-transfer? (get price listing) tx-sender (get seller listing)))
    (ok (map-set listings
      { listing-id: listing-id }
      (merge listing { active: false })))
  )
)

(define-read-only (get-listing (listing-id uint))
  (map-get? listings { listing-id: listing-id })
)

